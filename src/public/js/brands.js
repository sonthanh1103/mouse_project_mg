$(function () {
    // get
  function getBrands() {
    $.get('/api/brand/get', function (response) {
      $('#brandTableBody').empty(); 
      response.data.forEach(brand => {
        $('#brandTableBody').prepend(generateRow(brand));
      });
      $('.dataInput').prop('readonly', false); 
    });
  }
  
  getBrands();

  // add
    $('#addBrandBtn').on('click', function () {
        $.ajax({
            url: '/api/brand/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res) {
                    toastr.success(res.message)
                    getBrands();
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
    $(document).on('change', '.dataInput', function () {

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
        if (res) {
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
  $('#deleteBrandBtn').on('click', function () {
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
        getBrands();
      },
      error: function (error) {
        console.log(error)
      }
    });
  });
});

function generateRow(brand) {
  return `
    <tr data-id="${brand._id}">
      <td class="t_center"><input type="checkbox" class="brandCheckbox" data-id="${brand._id}"></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="name" value="${brand.name}" /></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="description" value="${brand.description}" /></td>
    </tr>
  `;
}