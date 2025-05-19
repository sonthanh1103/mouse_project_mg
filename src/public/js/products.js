$(function () {
  // Configs
  const enumFields = {
    shape: ['Symmetrical', 'Ergonomic', 'Hybrid'],
    hump_placement: ['Center', 'Back - minimal', 'Back - moderate', 'Back - aggressive'],
    hand_compatibility: ['Right', 'Left', 'Ambidextrous'],
    thumb_rest: ['Yes', 'No'],
    ring_finger_rest: ['Yes', 'No'],
    connectivity: ['Wireless', 'Wired'],
    sensor_technology: ['Optical', 'Laser'],
  };
  const refFields = new Set(['material', 'brand', 'front_flare', 'side_curvature', 'sensor']);
  const numFields = new Set([
    'length', 'width', 'height', 'weight',
    'dpi', 'polling_rate', 'tracking_speed', 'acceleration',
    'side_buttons', 'middle_buttons'
  ]);
  const booleanFields = ['thumb_rest', 'ring_finger_rest'];
  let lookup = {};

  // Lookup data and enable Add button
  $.get('/api/product/lookup', res => {
    if (res.success) {
      lookup = res.data;
      $('#addProductBtn').prop('disabled', false);
    } else {
      toastr.error('Cannot get ref data.');
    }
  });

  const filterGroups = [
    {
      label: 'Brand',
      fields: ['brand']
    },
    {
      label: 'Shape',
      fields: [
        'shape',
        'hump_placement',
        'front_flare',
        'side_curvature',
        'hand_compatibility',
        'thumb_rest',
        'ring_finger_rest'
      ]
    },
    {
      label: 'Dimensions',
      fields: ['length', 'width', 'height', 'weight']
    },
    {
      label: 'Material',
      fields: ['material']
    },
    {
      label: 'Sensor',
      fields: ['sensor', 'sensor_technology', 'sensor_position']
    },
    {
      label: 'Performance',
      fields: ['dpi', 'polling_rate', 'tracking_speed', 'acceleration']
    },
    {
      label: 'Buttons',
      fields: ['side_buttons', 'middle_buttons']
    },
    {
      label: 'Connectivity',
      fields: ['connectivity']
    }
  ];

  // Build filters UI
  function buildFilters(lookup) {
  const accordion = $('#filterAccordion').empty();
  let idx = 0;

  filterGroups.forEach(group => {
    const card = $(`
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${idx}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
            ${group.label}
          </button>
        </h2>
        <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#filterAccordion">
          <div class="accordion-body pb-2"></div>
        </div>
      </div>
    `);
    const body = card.find('.accordion-body');
    // Render từng field trong 1 dòng, mỗi field là 1 cột
    const row = $('<div class="d-flex flex-wrap gap-4 mb-2"></div>');
    group.fields.forEach(field => {
      // Enum & ref fields
      let opts = enumFields[field] || (refFields.has(field) ? lookup[field].map(o => o.name) : null);
      if (opts) {
        const isSearchable = (field === 'brand' || field === 'sensor');
        const col = $(`
          <div class="min-160">
            ${
              isSearchable
                ? `
                  <input type="text" class="form-control form-control-sm mb-2 filter-search" data-field="${field}" placeholder="Search...">`
                : (field === 'brand' || field === 'material' || field === 'connectivity' || field === 'sensor'
                    ? ''
                    : `<div class="fw-bold small mb-1">${capitalizeFirst(field.replace(/_/g, ' '))}</div>`)
            }
            <div class="d-flex flex-column gap-1"></div>
          </div>
        `);
        const checkWrap = col.find('div.d-flex');
        opts.forEach(opt => {
          checkWrap.append(`
            <div class="form-check form-check-inline">
              <input class="form-check-input filter-check" type="checkbox" data-field="${field}" data-value="${opt}" id="chk_${field}_${opt}">
              <label class="form-check-label small" for="chk_${field}_${opt}">${opt}</label>
            </div>
          `);
        });
        row.append(col);

        // search event for brand & sensor
        if (isSearchable) {
          col.find('.filter-search').on('input', function () {
            const keyword = $(this).val().toLowerCase();
            checkWrap.children('.form-check').each(function () {
              const label = $(this).find('label').text().toLowerCase();
              $(this).toggle(label.includes(keyword));
            });
          });
        }
      }
      // Numeric fields
      else if (numFields.has(field)) {
        row.append(`
          <div class="min-160">
            <div class="fw-bold small mb-1">${capitalizeFirst(field.replace(/_/g, ' '))}</div>
            <div class="d-flex gap-1 align-items-center">
              <input type="number" class="form-control form-control-sm filter-range w-80" data-field="${field}" data-type="min" placeholder="Min">
              <span class="mx-1">-</span>
              <input type="number" class="form-control form-control-sm filter-range w-80" data-field="${field}" data-type="max" placeholder="Max">
            </div>
          </div>
        `);
      }
    });
    body.append(row);
    accordion.append(card);
    idx++;
  });
}

  // Utility: get column index by field
  function getColumnIndex(field) {
    return table.column(`${field}:name`).index();
  }

  // Cell rendering (exported for DataTables)
  function renderCell(field) {
    return (value, _, row) => {
      const v = value && value._id ? value._id : (value ?? '');
      let disp = '';
      if (value && value.name) disp = value.name;
      else if (typeof value === 'boolean') disp = value ? 'Yes' : 'No';
      else disp = v === '' ? '&nbsp;' : v;
      return `<span class="cell w-100" data-field="${field}" data-id="${row._id}" data-value="${v}">${disp}</span>`;
    };
  }

  // Update field API
  function updateField(id, fields, cb) {
    const payload = {};
    Object.entries(fields).forEach(([f, v]) => {
      if (booleanFields.includes(f)) payload[f] = (v === 'Yes');
      else if (refFields.has(f) && !v) payload[f] = null;
      else payload[f] = v;
    });
    $.ajax({
      url: `/api/product/update/${id}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: res => {
        if (res.success) {
          toastr.success(res.message);
          cb?.();
        } else {
          toastr.error(res.message);
        }
      },
      error: xhr => toastr.error(xhr.responseJSON?.message || 'Update error')
    });
  }

  // DataTable setup
  const table = $('#productTable').DataTable({
    dom: '<"top-bar d-flex align-items-center justify-content-between flex-wrap mb-3"' +
         '<"left-group d-flex align-items-center">' +
         'l' +
         '<"middle-group d-flex align-items-center ms-auto">f' +
         '<"right-group d-flex align-items-center ms-auto btn-group flex-wrap">' +
         '>' +
         'rt' +
         '<"bottom-bar d-flex justify-content-between mt-3"ip>',
    language: { search: '', searchPlaceholder: 'Search' },
    pageLength: 50,
    order: [],
    ajax: {
      url: '/api/product/get',
      dataSrc: 'data'
    },
    scrollX: true,
    scrollCollapse: true,
    responsive: true,
    columns: [
      {
        data: null,
        orderable: false,
        className: 'text-center',
        render: (data, _, row) => `<input type="checkbox" class="productCheckbox" data-id="${row._id}">`
      },
      ...[
        'brand', 'name', 'length', 'width', 'height', 'weight', 'shape', 'hump_placement', 'front_flare', 'side_curvature',
        'hand_compatibility', 'thumb_rest', 'ring_finger_rest', 'material', 'connectivity', 'sensor', 'sensor_technology',
        'sensor_position', 'dpi', 'polling_rate', 'tracking_speed', 'acceleration', 'side_buttons', 'middle_buttons'
      ].map(f => ({ data: f, name: f, render: renderCell(f) }))
    ],
    initComplete: function () {
      $('.left-group').html(`
        <button class="btn btn-outline-primary me-2" id="filterBtn">
          <i class="bi bi-funnel"></i> Filter
        </button>
      `);
      $('.middle-group').html(`
          <h4 class="mt5">Product List</h4>
        `)
      $('.right-group').html(`
        <div class="btn-group flex-wrap">
          <button class="btn btn-outline-secondary me-2" id="deleteProductBtn">
          <i class="bi bi-trash"></i> Delete
          </button>
          <button class="btn btn-outline-success" id="addProductBtn">
          <i class="bi bi-plus-circle"></i> Add Product
          </button>
        </div>
      `);
      buildFilters(lookup);
      // $('#filterBtn').on('click', () => new bootstrap.Offcanvas($('#filterSidebar')[0]).show());
    }
  });

  // filter / close button
  $(document).on('click', '#filterBtn', function () {
    var $sidebar = $('#filterSidebar');
    var bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance($sidebar[0]);
    if ($sidebar.hasClass('show')) {
      bsOffcanvas.hide();
    } else {
      bsOffcanvas.show();
    }
  });

  $('#filterSidebar').on('shown.bs.offcanvas', function () {
    $('#mainContent').addClass('sidebar-pushed');
    $('#filterBtn')
      .html('<i class="bi bi-x-lg"></i> Close')
      .removeClass('btn-outline-primary').addClass('btn-outline-danger');
  });

  $('#filterSidebar').on('hidden.bs.offcanvas', function () {
    $('#mainContent').removeClass('sidebar-pushed');
    $('#filterBtn')
      .html('<i class="bi bi-funnel"></i> Filter')
      .removeClass('btn-outline-danger').addClass('btn-outline-primary');
  });

  // Filter logic
  $('#applyFiltersBtn').click(() => {
    $.fn.dataTable.ext.search = [];

    // Gom các giá trị checkbox được chọn theo từng field (OR logic)
    const checkedFieldValues = {};
    $('.filter-check:checked').each(function () {
      const { field, value } = $(this).data();
      if (!checkedFieldValues[field]) checkedFieldValues[field] = [];
      checkedFieldValues[field].push(value);
    });

    Object.entries(checkedFieldValues).forEach(([field, values]) => {
      $.fn.dataTable.ext.search.push((settings, data) => {
        const idx = getColumnIndex(field);
        if (idx === -1 || !values.length) return true;
        let cellRaw = data[idx];

        // Nếu là refField so sánh theo tên hiển thị, giống như options ở filter
        if (refFields.has(field)) {
          // cellRaw là tên brand/material,..
          return values.includes(cellRaw);
        }
        // Nếu là enum/boolean: so sánh trực tiếp
        return values.includes(cellRaw);
      });
    });

    // Range
    $('.filter-range').each(function () {
      const { field, type } = $(this).data();
      const num = parseFloat($(this).val());
      if (!isNaN(num)) {
        $.fn.dataTable.ext.search.push((settings, data) => {
          const idx = getColumnIndex(field);
          if (idx === -1) return true;
          let cellRaw = data[idx];
          if (typeof cellRaw === 'string') cellRaw = cellRaw.replace(/[^0-9.\-]/g, '');
          const cell = parseFloat(cellRaw);
          if (isNaN(cell)) return false;
          return type === 'min' ? cell >= num : cell <= num;
        });
      }
    });
    table.draw();
  });

  $('#clearFiltersBtn').click(() => {
    $('.filter-check, .filter-range').prop('checked', false).val('');
    $.fn.dataTable.ext.search = [];
    table.draw();
  });

  // Inline edit
  $('#productTable tbody').on('click', '.cell', function () {
    const $span = $(this);
    if ($span.data('editing')) return;
    const field = $span.data('field');
    const id = $span.data('id');
    const oldVal = $span.data('value');
    $span.data('editing', true);
    let $editor;
    if (enumFields[field]) {
      $editor = $('<select class="cell-editor form-select form-select-sm"></select>');
      enumFields[field].forEach(opt =>
        $editor.append(`<option value="${opt}" ${opt === oldVal ? 'selected' : ''}>${opt}</option>`)
      );
    } else if (refFields.has(field)) {
      $editor = $('<select class="cell-editor form-select form-select-sm"></select>');
      lookup[field].forEach(opt =>
        $editor.append(`<option value="${opt._id}" ${opt._id == oldVal ? 'selected' : ''}>${opt.name}</option>`)
      );
    } else {
      $editor = $(`<input type="${numFields.has(field) ? 'number' : 'text'}" class="cell-editor form-control form-control-sm" value="${oldVal}">`);
    }
    $span.empty().append($editor);
    $editor.focus().select();
    $editor.on('blur keydown', function (e) {
      if (e.type === 'keydown' && e.which !== 13) return;
      const newVal = $editor.val();
      if (newVal != oldVal) {
        updateField(id, { [field]: newVal }, () => finish(newVal));
      } else {
        finish(newVal);
      }
    });
    function finish(val) {
      let disp = val;
      if (enumFields[field]) disp = val;
      else if (typeof val === 'boolean') disp = val ? 'Yes' : 'No';
      else if (refFields.has(field)) {
        const obj = lookup[field].find(o => o._id == val);
        disp = obj ? obj.name : '&nbsp;';
      } else disp = val === '' ? '&nbsp;' : val;
      $span.data({ editing: false, value: val }).attr('class', 'cell w-100').html(disp);
      table.order(table.order()).draw(); // Keep order after edit
    }
  });

  // Add product
  $('#productTable_wrapper').on('click', '#addProductBtn', function () {
    const defaultProductData = {};
    ['brand', 'material', 'front_flare', 'side_curvature', 'sensor'].forEach(field =>
      defaultProductData[field] = lookup[field]?.[0]?._id || null
    );
    $.ajax({
      url: '/api/product/create',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(defaultProductData),
      success: res => {
        if (!res.success) {
           toastr.error(res.message || 'Failed to add');
           return;
        }
        $('.filter-check, .filter-range').prop('checked', false).val('');
        $.fn.dataTable.ext.search = [];
        table.ajax.reload(null, true);
        toastr.success(res.message || 'Added successfully');
      },
      error: xhr => toastr.error(xhr.responseJSON?.message || 'An error occurred while adding the product')
    });
  });

  // Select all
  $('#selectAll').on('change', function () {
    $('.productCheckbox').prop('checked', $(this).prop('checked'));
  });

  // Delete selected
  $('#productTable_wrapper').on('click', '#deleteProductBtn', function () {
    const selectedProducts = $('.productCheckbox:checked').map((_, el) => $(el).data('id')).get();
    if (!selectedProducts.length) return toastr.warning('Please choose at least one product.');
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`)) return;
    $.ajax({
      url: '/api/product/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ productIds: selectedProducts }),
      success: res => {
        if (res.success) {
          table.ajax.reload(null, true);
          toastr.success(res.message);
          $('#selectAll').prop('checked', false);
        } else {
          toastr.error(res.message);
        }
      },
      error: xhr => toastr.error(xhr.responseJSON?.message || 'An error occurred while processing your request')
    });
  });
});