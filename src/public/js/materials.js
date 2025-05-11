$(function () {
  // get all data
  function getMaterials(s = '') {
    const query = s ? `?s=${encodeURIComponent(s)}` : '';
    $.get(`/api/material/get${query}`, function (response) {
      $('#materialTableBody').empty(); 
      response.data.forEach(material => {
        $('#materialTableBody').prepend(generateRow(material));
      });
      $('.dataInput').prop('readonly', false); 
    });
  }
  
  // get (s) from query
  $('#search-form').on('submit', function (e) {
    e.preventDefault();
    const s = $('#searchMaterialInput').val().trim();
    getMaterials(s);
  })
  
  getMaterials();

  // add
    $('#addMaterialBtn').on('click', function () {
        $.ajax({
            url: '/api/material/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res) {
                    toastr.success(res.message)
                    getMaterials();
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
      url: `/api/material/update/${id}`,
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
    $('.materialCheckbox').prop('checked', $(this).prop('checked'));
  });
  
  // delete
  $('#deleteMaterialBtn').on('click', function () {
    const selectedMaterials = $('.materialCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
  
    if (selectedMaterials.length === 0) {
      toastr.warning("Please choose at least one material.");
      return;
    }
  
     if(!confirm(`Are you sure you want to delete ${selectedMaterials.length} material${selectedMaterials.length > 1 ? 's' : ''}?`)) return;
  
    $.ajax({
      url: '/api/material/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ materialIds: selectedMaterials }),
      success: function (res) {
        toastr.success(res.message)
        getMaterials();
        $('#selectAll').prop('checked', false);
      },
      error: function (error) {
        toastr.error(error.responseJSON?.message)
      }
    });
  }); 
});

function generateRow(material) {
  return `
    <tr data-id="${material._id}">
      <td class="t_center"><input type="checkbox" class="materialCheckbox" data-id="${material._id}"></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="name" value="${material.name}" /></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="description" value="${material.description}" /></td>
      </tr>
  `;
}