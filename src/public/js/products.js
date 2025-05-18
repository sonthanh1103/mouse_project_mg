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

  // Build filters UI
  function buildFilters(lookup) {
    const accordion = $('#filterAccordion').empty();
    let idx = 0;
    // Build enum & ref fields
    const mergedFields = { ...enumFields };
    refFields.forEach(f => (mergedFields[f] = lookup[f].map(o => o.name)));
    Object.entries(mergedFields).forEach(([field, opts]) => {
      const card = $(`
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
              ${field.replace(/_/g, ' ').toUpperCase()}
            </button>
          </h2>
          <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#filterAccordion">
            <div class="accordion-body"></div>
          </div>
        </div>
      `);
      opts.forEach(opt => {
        card.find('.accordion-body').append(`
          <div class="form-check">
            <input class="form-check-input filter-check" type="checkbox" data-field="${field}" data-value="${opt}" id="chk_${field}_${opt}">
            <label class="form-check-label" for="chk_${field}_${opt}">${opt}</label>
          </div>
        `);
      });
      accordion.append(card);
      idx++;
    });
    // Numeric fields
    numFields.forEach(field => {
      accordion.append(`
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
              ${field.replace(/_/g, ' ').toUpperCase()} RANGE
            </button>
          </h2>
          <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#filterAccordion">
            <div class="accordion-body">
              <div class="mb-2">
                <label class="form-label">Min</label>
                <input type="number" class="form-control filter-range" data-field="${field}" data-type="min">
              </div>
              <div>
                <label class="form-label">Max</label>
                <input type="number" class="form-control filter-range" data-field="${field}" data-type="max">
              </div>
            </div>
          </div>
        </div>
      `);
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
         '<"search-only mx-auto d-flex justify-content-center align-items-center">f' +
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
        <button class="btn btn-outline-primary me-2" id="filterBtn" data-bs-toggle="collapse" 
          data-bs-target="#filterPanel"
          aria-expanded="false"
          aria-controls="filterPanel">Filter</button>
      `);
      $('.right-group').html(`
        <div class="btn-group flex-wrap">
          <button class="btn btn-outline-secondary me-2" id="deleteProductBtn">Delete</button>
          <button class="btn btn-outline-success" id="addProductBtn">Add Product</button>
        </div>
      `);
      buildFilters(lookup);
      $('#filterBtn').on('click', () => new bootstrap.Offcanvas($('#filterSidebar')[0]).show());
    }
  });

  // Filter logic
  $('#applyFiltersBtn').click(() => {
    $.fn.dataTable.ext.search = [];
    // Checkbox
    $('.filter-check:checked').each(function () {
      const { field, value } = $(this).data();
      $.fn.dataTable.ext.search.push((settings, data) =>
        data[getColumnIndex(field)] == value
      );
    });
    // Range
    $('.filter-range').each(function () {
      const { field, type } = $(this).data();
      const num = parseFloat($(this).val());
      if (!isNaN(num)) {
        $.fn.dataTable.ext.search.push((settings, data) => {
          const idx = getColumnIndex(field);
          if (idx === -1) return true; // Bỏ qua filter nếu không tìm thấy cột
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
        if (!res.success) return toastr.error(res.message || 'Failed to add');
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