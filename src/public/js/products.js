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

  // initial DataTable
  const table = $('#productTable').DataTable({
    order: [],
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
      // Name column: brand + name inline
      {
        data: null,
        render: (data, type, row) => {
          const bId = row.brand?._id || '';
          const bName = row.brand?.name || '';
          const model = row.name || '';
          // brand span
          return `<div class="product-name-cell d-flex align-items-center">
                    <span class="cell cell-brand" data-field="brand" data-id="${row._id}" data-value="${bId}">${bName || '&nbsp;'}</span>
                    <span class="cell cell-name"  data-field="name"  data-id="${row._id}" data-value="${model}">${model || '&nbsp;'}</span>
                  </div>`;
        }
      },
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
    ]
  });

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


  // inline edit
  $('#productTable tbody').on('click', '.cell', function() {
    const $span = $(this);
    if ($span.data('editing')) return;
    const field = $span.data('field');
    const id = $span.data('id');
    const oldVal = $span.data('value');
    $span.data('editing', true);

    // handle (brand + name)
    if (field === 'brand' || field === 'name') {
      const $container = $span.closest('.product-name-cell');
      const bVal = $container.find('.cell-brand').data('value');
      const nVal = $container.find('.cell-name').data('value');
      $container.empty();
      // Brand select
      const $brandSel = $('<select class="brand-editor form-select form-select-sm me-1"></select>');
      lookup.brand.forEach(b => {
        const sel = b._id === bVal ? 'selected' : '';
        $brandSel.append(`<option value="${b._id}" ${sel}>${b.name}</option>`);
      });
      // Name input
      const $nameInput = $(`<input type="text" class="name-editor form-control form-control-sm" value="${nVal}">`);
      $container.append($brandSel, $nameInput);

      // Handlers
      $brandSel.on('change', function() {
        const newBrand = this.value;
        const newName  = $container.find('.cell-name').data('value');
        updateField(id, { brand: newBrand, name: newName }, () => table.ajax.reload(null, false));
      });
      $nameInput.on('blur keydown', function(e) {
        if (e.type === 'keydown' && e.which !== 13) return;

        const newName = $(this).val();
        const selectedBrandId = $brandSel.val();
        const selectedBrandName = $brandSel.find('option:selected').text();

        $container.empty()
          .append(`<span class="cell cell-brand" data-field="brand" data-id="${id}" data-value="${selectedBrandId}">${selectedBrandName || '&nbsp;'}</span>`)
          .append(`<span class="cell cell-name"  data-field="name"  data-id="${id}" data-value="${newName}">${newName || '&nbsp;'}</span>`);

        if (newName !== nVal) {
            updateField(id, { brand: selectedBrandId, name: newName }, () => () => table.ajax.reload(null, false));
        }
      });
      return;
    }

    // general fields
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
  $('#addProductBtn').on('click', function () {
    
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
  $('#deleteProductBtn').on('click', function () {
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
    if (value && value.name) {disp = value.name;
  }
    else if (typeof value === 'boolean') disp = value ? 'Yes' : 'No';
    else disp = v === '' ? '&nbsp;' : v;
    return `<span class="cell w-100" data-field="${field}" data-id="${row._id}" data-value="${v}">${disp}</span>`;
  };
}