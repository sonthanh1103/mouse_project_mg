$(function () {
  // get all data
  function getFrontFlares(s = '') {
    const query = s ? `?s=${encodeURIComponent(s)}` : '';
    $.get(`/api/front-flare/get${query}`, function (response) {
      $('#frontFlareTableBody').empty(); 
      response.data.forEach(frontFlare => {
        $('#frontFlareTableBody').prepend(generateRow(frontFlare));
      });
      $('.dataInput').prop('readonly', false); 
    });
  }

  // get (s) from query
  $('#search-form').on('submit', function (e) {
    e.preventDefault();
    const s = $('#searchFrontFlareInput').val().trim();
    getFrontFlares(s);
  })
  
  getFrontFlares();

  // add
    $('#addFrontFlareBtn').on('click', function () {
        $.ajax({
            url: '/api/front-flare/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res) {
                    toastr.success(res.message)
                    getFrontFlares();
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
      url: `/api/front-flare/update/${id}`,
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
    $('.frontflareCheckbox').prop('checked', $(this).prop('checked'));
  });
  
  // delete
  $('#deleteFrontFlareBtn').on('click', function () {
    const selectedFrontFlares = $('.frontflareCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
  
    if (selectedFrontFlares.length === 0) {
      toastr.warning("Please choose at least one front flare.");
      return;
    }
  
     if(!confirm(`Are you sure you want to delete ${selectedFrontFlares.length} front flare${selectedFrontFlares.length > 1 ? 's' : ''}?`)) return;
  
    $.ajax({
      url: '/api/front-flare/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ frontFlareIds: selectedFrontFlares }),
      success: function (res) {
        toastr.success(res.message)
        getFrontFlares();
        $('#selectAll').prop('checked', false);
      },
      error: function (error) {
        toastr.error(error.responseJSON?.message || "Delete failed")
      }
    });
  }); 
});

function generateRow(frontFlare) {
  return `
    <tr data-id="${frontFlare._id}">
      <td class="t_center"><input type="checkbox" class="frontflareCheckbox" data-id="${frontFlare._id}"></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="name" value="${frontFlare.name}" /></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="description" value="${frontFlare.description}" /></td>
      </tr>
  `;
}