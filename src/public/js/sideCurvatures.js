$(function () {
  // get all data
  function getSideCurvatures(s = '') {
    const query = s ? `?s=${encodeURIComponent(s)}` : '';
    $.get(`/api/side-curvature/get${query}`, function (response) {
      $('#sideCurvatureTableBody').empty(); 
      response.data.forEach(sideCurvature => {
        $('#sideCurvatureTableBody').prepend(generateRow(sideCurvature));
      });
      $('.dataInput').prop('readonly', false); 
    });
  }
  
  //get (s) from query / submit
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    const s = $('#searchSideCurvatureInput').val().trim();
    getSideCurvatures(s);
  })

  // initial load
  getSideCurvatures();

  // add
    $('#addSideCurvatureBtn').on('click', function () {
        $.ajax({
            url: '/api/side-curvature/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res) {
                    toastr.success(res.message)
                    getSideCurvatures();
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
      url: `/api/side-curvature/update/${id}`,
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
    $('.sideCurvatureCheckbox').prop('checked', $(this).prop('checked'));
  });
  
  // delete
  $('#deleteSideCurvatureBtn').on('click', function () {
    const selectedSideCurvatures = $('.sideCurvatureCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
  
    if (selectedSideCurvatures.length === 0) {
      toastr.warning("Please choose at least one side curvature.");
      return;
    }
  
     if(!confirm(`Are you sure you want to delete ${selectedSideCurvatures.length} side curvature${selectedSideCurvatures.length > 1 ? 's' : ''}?`)) return;
  
    $.ajax({
      url: '/api/side-curvature/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ sideCurvatureIds: selectedSideCurvatures }),
      success: function (res) {
        if (res) {
          toastr.success(res.message)
          getSideCurvatures();
          $('#selectAll').prop('checked', false);
          return;
        }
        toastr.error(res.message);
      },
      error: function (error) {
        toastr.error(error.responseJSON?.message || "Delete failed")
      }
    });
  }); 
});

function generateRow(sideCurvature) {
  return `
    <tr data-id="${sideCurvature._id}">
      <td class="t_center"><input type="checkbox" class="sideCurvatureCheckbox" data-id="${sideCurvature._id}"></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="name" value="${sideCurvature.name}" /></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="description" value="${sideCurvature.description}" /></td>
      </tr>
  `;
}