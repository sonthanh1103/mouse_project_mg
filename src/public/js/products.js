toastr.options = {
  escapeHtml: false,
  closeButton: true,
  timeOut: 2000,
  positionClass: 'toast-top-right'
};

$(document).ready(function () {
  // const renderInput = (field) => (data, type, row) => {
  //   return `<input type="text"class="form-control dataInput" data-field="${field}" data-id="${row._id}" value="${data}" />`
  // };
  $('#productTable').DataTable({
    order: [],
    ajax: {
      url: '/api/product/get',
      dataSrc: 'data',
      error: function(xhr, status, error) {
        console.error('DataTables Ajax error:', status, error);
        console.error('Server response:', xhr.responseText);
      }
    },
    scrollX: true,        
    scrollCollapse: true, 
    responsive: true,
    columnDefs: [
      { targets: '_all', defaultContent: '' }
    ],  
    columns: [
      {
        data: null,
        className: 'text-center',
        render: function (data, type, row) {
          return `<input type="checkbox" class="productCheckbox row-checkbox" data-id="${row._id}" />`;
        },
        orderable: false
      },
      { data: null,
        render: function(data, type, row) { 
          const brandName = row.brand ? row.brand.name : 'No Brand';
          return `<div class="product-name-cell">
                    <div class="brand-name">${brandName}</div>
                    <div class="model-name">${row.name}</div>
                  </div>`;
        }
       },
      { data: 'length' },
      { data: 'width' },
      { data: 'height' },
      { data: 'weight' },
      { data: 'shape' },
      { data: 'hump_placement' },
      { data: 'front_flare' },
      { data: 'side_curvature' },
      { data: 'hand_compatibility' },
      { data: 'thumb_rest',
        render: function(data) {
          return data === true ? 'Yes' : 'No';
        }
       }, 
      { data: 'ring_finger_rest',
        render: function(data) {
          return data === true ? 'Yes' : 'No';
        }
       },
      { data: 'material' },
      { data: 'connectivity' },
      { data: 'sensor' },
      { data: 'sensor_technology' },
      { data: 'sensor_position' },
      { data: 'dpi' },
      { data: 'polling_rate' },
      { data: 'tracking_speed' },
      { data: 'acceleration' },
      { data: 'side_buttons' },
      { data: 'middle_buttons' }
    ]
  });
});

$('#addProductBtn').on('click', function () {
  $.ajax({
    url: '/api/product/create',
    method: 'POST',
    contentType: 'application/json',
    success: function (res) {
      if (res && res.success) {
        $('#productTable').DataTable().ajax.reload(null, false);
        toastr.success(res.message || 'Added successfully');
      } else {
        toastr.error(res.message || 'Failed to add');
      }
    },
    error: function (xhr) {
      const errorMessage = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'An error occurred while adding the product';
      toastr.error(errorMessage);
    }
  });
});


$(document).on('change', '.dataInput', function () {
  const $input = $(this);
  const id = $input.data('id');
  const field = $input.data('field');
  let value = $input.val();

  $.ajax({
    url: `/api/product/update/${id}`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ [field]: value }),
    success: function (res) {
      if (res && res.success) {
        toastr.success(res.message || 'Updated successfully');
      } else {
        toastr.error(res.message || 'Update failed');
      }
    },
    error: function (xhr) {
      const msg = xhr.responseJSON && xhr.responseJSON.message
        ? xhr.responseJSON.message
        : 'Error updating product';
      toastr.error(msg);
    }
  });
});


$('#selectAll').on('change', function () {
  const isChecked = $(this).prop('checked');
  $('.productCheckbox').prop('checked', isChecked);
});

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
      if (res && res.success) {
        $('#productTable').DataTable().ajax.reload(null, true);
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
})


