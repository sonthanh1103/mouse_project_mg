// public/js/products.js

$(function() {
  // Enum and boolean fields config
  const enumFields = {
    shape: ['Symmetrical','Ergonomic','Hybrid'],
    hump_placement: ['Center','Back - minimal','Back - moderate','Back - aggressive'],
    hand_compatibility: ['Right','Left','Ambidextrous'],
    thumb_rest: ['Yes','No'],
    ring_finger_rest: ['Yes','No'],
    connectivity: ['Wireless','Wired'],
    sensor_technology: ['Optical','Laser']
  };
  // Ref and number fields
  const refFields = new Set(['material','brand', 'front_flare', 'side_curvature', 'sensor']);
  const numFields = new Set(['length','width','height','weight','dpi','polling_rate','tracking_speed','acceleration','side_buttons','middle_buttons']);

 // lookup data
 let lookup = {};

  $.get('/api/product/lookup', function (res) {
    if (res.success) {
      lookup = res.data;
      $('#addProductBtn').prop('disabled', false);
    } else {
      toastr.error('Cannot get ref data.');
    }
  });

  function buildFilters(lookup) {
    const accordion = $('#filterAccordion');
    let idx = 0;
    // ref and enum fields: multi-checkbox
    Object.entries({...enumFields, ...Object.fromEntries(Array.from(refFields).map(f=>[f,lookup[f].map(o=>o.name)]))}).forEach(([field, opts]) => {
      const card = $(
        `<div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
              ${field.replace(/_/g,' ').toUpperCase()}
            </button>
          </h2>
          <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#filterAccordion">
            <div class="accordion-body">
            </div>
          </div>
        </div>`
      );
      opts.forEach(opt => {
        card.find('.accordion-body').append(
          `<div class="form-check">
             <input class="form-check-input filter-check" type="checkbox" data-field="${field}" data-value="${opt}" id="chk_${field}_${opt}">
             <label class="form-check-label" for="chk_${field}_${opt}">${opt}</label>
           </div>`
        );
      });
      accordion.append(card);
      idx++;
    });
    // numeric fields: min/max inputs
    numFields.forEach(field => {
      const card = $(
        `<div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
              ${field.replace(/_/g,' ').toUpperCase()} RANGE
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
        </div>`
      );
      accordion.append(card);
      idx++;
    });
  }


  // initial DataTable
  const table = $('#productTable').DataTable({
   dom: '<"top-bar d-flex align-items-center mb-3"' + // top-bar
          '<"left-group d-flex align-items-center">' +  // filter button
          'l' +                                       // length dropdown
          '<"search-only mx-3 d-flex justify-content-center align-items-center">' + // search-only: f - filter (search)
          'f' +
          '<"right-group d-flex align-items-center ms-auto">' + // delete & ddd button
         '>' +
      'rt' +
      '<"bottom-bar d-flex justify-content-between mt-3"ip>', // bottom-bar: i - info, p- paginatiom 
    language: {
      search: '', // remove "Search:"
      searchPlaceholder: 'Search' // set placeholder
    },
    pageLength: 50, // limit per page
    order: [],  // no initial order
    ajax: { 
    url: '/api/product/get',
    dataSrc: 'data' 
    },
    scrollX: true,
    scrollCollapse: true, 
    responsive: true,
    columns: [
      // checkbox
      {
        data: null,
        orderable: false,
        className: 'text-center',
        render: function (data, type, row) {
          return `<input type="checkbox" class="productCheckbox" data-id="${row._id}">`
        }
      },
      // others
      { data: 'brand', render: renderCell('brand') },
      { data: 'name', render: renderCell('name') },
      { data: 'length', render: renderCell('length') },
      { data: 'width', render: renderCell('width') },
      { data: 'height', render: renderCell('height') },
      { data: 'weight', render: renderCell('weight') },
      { data: 'shape', render: renderCell('shape') },
      { data: 'hump_placement', render: renderCell('hump_placement') },
      { data: 'front_flare', render: renderCell('front_flare') },
      { data: 'side_curvature', render: renderCell('side_curvature') },
      { data: 'hand_compatibility', render: renderCell('hand_compatibility') },
      { data: 'thumb_rest', render: renderCell('thumb_rest') },
      { data: 'ring_finger_rest', render: renderCell('ring_finger_rest') },
      { data: 'material', render: renderCell('material') },
      { data: 'connectivity', render: renderCell('connectivity') },
      { data: 'sensor', render: renderCell('sensor') },
      { data: 'sensor_technology', render: renderCell('sensor_technology') },
      { data: 'sensor_position', render: renderCell('sensor_position') },
      { data: 'dpi', render: renderCell('dpi') },
      { data: 'polling_rate', render: renderCell('polling_rate') },
      { data: 'tracking_speed', render: renderCell('tracking_speed') },
      { data: 'acceleration', render: renderCell('acceleration') },
      { data: 'side_buttons', render: renderCell('side_buttons') },
      { data: 'middle_buttons', render: renderCell('middle_buttons') }
    ],
      initComplete: function () {
        $('.left-group').html(`<button class="btn btn-outline-primary me-2" id="filterBtn" data-bs-toggle="collapse" 
          data-bs-target="#filterPanel"
          aria-expanded="false"
          aria-controls="filterPanel">Filter
        </button>
        `);
        $('.right-group').html(`
          <button class="btn btn-outline-secondary me-2" id="deleteProductBtn">Delete</button>
          <button class="btn btn-outline-success" id="addProductBtn">Add Product</button>
        `)
        buildFilters(lookup);
          $('#filterBtn').on('click', function() {
          const filterSidebar = new bootstrap.Offcanvas($('#filterSidebar')[0]);
          filterSidebar.show();
      });
    }
    // use to get button from html
    // initComplete() {
    //   const topBar = $('.top-bar'); // top-bar
    //   topBar.find('.left-group').append($('#filterBtn')); // Append Filter btn
    //   topBar.find('.search-bar').append(topBar.find('.dataTables_filter')); // Append search input
    //   topBar.find('.right-group').append($('#deleteProductBtn')).append($('#addProductBtn')); // Append Delete & Add buttons
    //   // Build filters lookup
    //   $.get('/api/product/lookup', res => {
    //     if (res.success) buildFilters(res.data);
    //     $('#addProductBtn').prop('disabled', false);
    //   });
    // }
  });

  // apply filter
  $('#applyFiltersBtn').click(() => {
    $.fn.dataTable.ext.search = [];
    // checkbox filters
    $('.filter-check:checked').each(function() {
      const field = $(this).data('field');
      const val = $(this).data('value');
      $.fn.dataTable.ext.search.push((settings, data) => data[getColumnIndex(field)] == val);
    });
    // range filters
    $('.filter-range').each(function() {
      const field = $(this).data('field');
      const type = $(this).data('type');
      const num = parseFloat($(this).val());
      if (!isNaN(num)) {
        $.fn.dataTable.ext.search.push((settings, data) => {
          const cell = parseFloat(data[getColumnIndex(field)]) || 0;
          return type === 'min' ? cell >= num : cell <= num;
        });
      }
    });
    table.draw();
  });

  // remove selection
  $('#clearFiltersBtn').click(() => {
    $('.filter-check, .filter-range').prop('checked', false).val('');
    $.fn.dataTable.ext.search = [];
    table.draw();
  });

  // Utility to map field to column index
  function getColumnIndex(field) {
    const headers = $('#productTable thead th').map((i,el) => $(el).text().toLowerCase().replace(/[^a-z]/g,''));
    const idx = headers.get().indexOf(field.replace(/_/g,''));
    return idx;
  }

  // inline edit
  $('#productTable tbody').on('click', '.cell', function() {
    const $span = $(this);
    if ($span.data('editing')) return;
    const field = $span.data('field');
    const id = $span.data('id');
    const oldVal = $span.data('value');
    $span.data('editing', true);

    // handle general fields
    let $editor;
    if (enumFields[field]) {
      $editor = $('<select class="cell-editor form-select form-select-sm"></select>');
      enumFields[field].forEach(opt => {
        const sel = opt === oldVal ? 'selected' : '';
        $editor.append(`<option value="${opt}" ${sel}>${opt}</option>`);
      });
    } else if (refFields.has(field)) {
      $editor = $('<select class="cell-editor form-select form-select-sm"></select>');
      lookup[field].forEach(opt => {
        const sel = opt._id === oldVal ? 'selected' : '';
        $editor.append(`<option value="${opt._id}" ${sel}>${opt.name}</option>`);
      });
    } else {
      const type = numFields.has(field) ? 'number' : 'text';
      $editor = $(`<input type="${type}" class="cell-editor form-control form-control-sm" value="${oldVal}">`);
    }
    $span.empty().append($editor);  
    $editor.focus().select();

    $editor.on('blur keydown', function(e) {
      if (e.type === 'keydown' && e.which !== 13) return;
      const newVal = $editor.val();
     if (newVal != oldVal) {
        updateField(id, { [field]: newVal }, () => {
          finish(newVal);
          table.order(table.order()).draw();
        });
      } else {
        finish(newVal);
      }
    });

    //finish func
    function finish(val) {
      let disp = val;
      if (enumFields[field]) disp = val;
      else if (typeof val === 'boolean') disp = val ? 'Yes' : 'No';
      else if (refFields.has(field)) {
        const obj = lookup[field].find(o => o._id === val);
        disp = obj ? obj.name : '&nbsp;';
      } else {
        disp = val === '' ? '&nbsp;' : val;
      }
      $span.data({ editing: false, value: val }).attr('class', 'cell w-100').html(disp);
    }
  });

  // update
  function updateField(id, fields, cb) {
    const booleanFields = ['thumb_rest', 'ring_finger_rest'];
    const payload = {};

    Object.entries(fields).forEach(([f, v]) => {
      if (booleanFields.includes(f)) {
        payload[f] = (v === 'Yes');
      } else if (refFields.has(f) && (v === '' || v === null)) {
        payload[f] = null;
      } else {
        payload[f] = v;
      }
    })
    $.ajax({ url: `/api/product/update/${id}`,
      method: 'PUT', 
      contentType: 'application/json', 
      data: JSON.stringify(payload), 
      success: function (res) {
        if (res.success) {
          toastr.success(res.message);
          if (typeof cb === 'function') cb();
        } else {
          toastr.error(res.message);
        }
      }, 
      error: (xhr) => {
        const errorMessage = xhr.responseJSON.message;
        toastr.error(errorMessage || 'Update error');
        }
    })
  }

  // add
  $('#productTable_wrapper').on('click', '#addProductBtn', function () {
  // $('#addProductBtn').on('click', function () {
    
    const defaultProductData = {
    brand: lookup.brand.length > 0 ? lookup.brand[0]._id : null,
    material: lookup.material.length > 0 ? lookup.material[0]._id : null,
    front_flare: lookup.front_flare.length > 0 ? lookup.front_flare[0]._id : null,
    side_curvature: lookup.side_curvature.length > 0 ? lookup.side_curvature[0]._id : null,
    sensor: lookup.sensor.length > 0 ? lookup.sensor[0]._id : null
    };

    $.ajax({
      url: '/api/product/create',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(defaultProductData),
      success: function (res) {
        if (!res.success) {
          toastr.error(res.message || 'Failed to add');
          return;
        } 
        table.ajax.reload(null, true);
        toastr.success(res.message || 'Added successfully');
      },
      error: function (xhr) {
        console.log(xhr)
        const errorMessage = xhr.responseJSON?.message || 'An error occurred while adding the product';
        toastr.error(errorMessage);
      }
    });
  });
  
  //select all checkbox
  $('#selectAll').on('change', function () {
  const isChecked = $(this).prop('checked');
    $('.productCheckbox').prop('checked', isChecked);
  });
  
  //delete checkboxes selected

  //  $('#deleteProductBtn').on('click', function () {
  $('#productTable_wrapper').on('click', '#deleteProductBtn', function () {
    const selectedProducts = $('.productCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
    
    if (selectedProducts.length === 0) {
      toastr.warning('Please choose at least one product.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's':''}`)) return;
    
    $.ajax({
      url: '/api/product/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ productIds: selectedProducts }),
      success: function (res) {
        if (res.success) {
          table.ajax.reload(null, true);
          toastr.success(res.message);
          $('#selectAll').prop('checked', false); 
        } else {
          toastr.error(res.message);
        }
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON && xhr.responseJSON.message
        ? xhr.responseJSON.message : 'An error occurred while processing your request';
        toastr.error(errorMessage)
      }
    })
  });
})

// render Cells
function renderCell(field) {
  return (value, type, row) => {
    const v = value && value._id ? value._id : (value != null ? value : '');
    let disp = '';
    if (value && value.name) {disp = value.name;0
  }
    else if (typeof value === 'boolean') disp = value ? 'Yes' : 'No';
    else disp = v === '' ? '&nbsp;' : v;
    return `<span class="cell w-100" data-field="${field}" data-id="${row._id}" data-value="${v}">${disp}</span>`;
  };
}