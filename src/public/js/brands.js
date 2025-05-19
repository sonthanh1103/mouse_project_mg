$(function () {
  // initial DataTable
  const table = $('#brandTable').DataTable({
    dom: '<"top-bar d-flex justify-content-between align-items-center flex-wrap mb-2"l' +
         'f' +
         '<"right-group d-flex justify-content-between align-items-center">' +
         '>' +
         'rt' +
         '<"bottom-bar d-flex justify-content-between mt-3 mb-3"ip>',
    order: [],
    ajax: {
      url: '/api/brand/get',
      dataSrc: 'data'
    },
    pageLength: 50,
    language: { search: '', searchPlaceholder: 'Search' },
    columns: [
      {
        data: null,
        orderable: false,
        className: 'text-center',
        render: (data, type, row) => `<input type="checkbox" class="brandCheckbox" data-id="${row._id}">`
      },
      { 
        data: 'name', 
        render: (data, type, row) => `<input type="text" class="dataInput border-0 w-100 form-control" data-field="name" value="${data}" />`
      },
      { 
        data: 'description', 
        render: (data, type, row) => `<input type="text" class="dataInput border-0 w-100 form-control" data-field="description" value="${data}" />`
      }
    ],
    rowCallback: function(row, data) {
      // Tag row with data-id for update
      $(row).attr('data-id', data._id);
    },
    initComplete: function () {
      $('.right-group').html(`
         <div class="btn-group">
              <button class="btn btn-outline-secondary me-2" id="deleteBrandBtn">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
              <button class="btn btn-outline-success" id="addBrandBtn">
                <i class="bi bi-person-plus me-1"></i> Add Brand
              </button>
        </div>
      `)
    }
  })

  // add
    $('#brandTable_wrapper').on('click', '#addBrandBtn', function () {
        $.ajax({
            url: '/api/brand/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res.success) {
                    toastr.success(res.message)
                    table.ajax.reload(null, true);
                } else {
                    toastr.error(res.message);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON?.message);
            }
        });
    })

  // update
    $('#brandTable tbody').on('change', '.dataInput', function () {

    let row = $(this).closest('tr');
    let id = row.attr('data-id');
    
    let name = row.find('[data-field="name"]').val();
    let description = row.find('[data-field="description"]').val();

    let updateData = { name, description };

    $.ajax({
      url: `/api/brand/update/${id}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify( updateData ),
      success: function (res) {
        if (res.success) {
            toastr.success(res.message);
            return;
        }
        toastr.error(res.message);
      },
      error: function (error) {
        toastr.error(error.responseJSON?.message)
      }
    });
  });

  // select all checkbox
  $('#selectAll').on('change', function () {
    $('.brandCheckbox').prop('checked', $(this).prop('checked'));
  });
  
  // delete
  $('#brandTable_wrapper').on('click', '#deleteBrandBtn', function () {
    const selectedBrands = $('.brandCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
  
    if (selectedBrands.length === 0) {
      toastr.warning("Please choose at least one brand.");
      return;
    }
  
     if(!confirm(`Are you sure you want to delete ${selectedBrands.length} brand${selectedBrands.length > 1 ? 's' : ''}?`)) return;
  
    $.ajax({
      url: '/api/brand/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ brandIds: selectedBrands }),
      success: function (res) {
        toastr.success(res.message)
        table.ajax.reload(null, true);
        $('#selectAll').prop('checked', false);
      },
      error: function (error) {
        toastr.error(error)
      }
    });
  });
});
