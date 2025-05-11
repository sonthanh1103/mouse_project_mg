$(function () {
  // get all data
  function getSensors(s = '') {
    const query = s ? `?s=${encodeURIComponent(s)}` : '';
    $.get(`/api/sensor/get${query}`, function (response) {
      $('#sensorTableBody').empty(); 
      response.data.forEach(sensor => {
        $('#sensorTableBody').prepend(generateRow(sensor));
      });
      $('.dataInput').prop('readonly', false); 
    });
  }
  
  // get (s) from query
  $('#search-form').on('submit', function (e) {
    e.preventDefault();
    const s = $('#searchSensorInput').val().trim();
    getSensors(s);
  })
  
  getSensors();

  // add
    $('#addSensorBtn').on('click', function () {
        $.ajax({
            url: '/api/sensor/create',
            method: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res) {
                    toastr.success(res.message)
                    getSensors();
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
      url: `/api/sensor/update/${id}`,
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
    $('.sensorCheckbox').prop('checked', $(this).prop('checked'));
  });
  
  // delete
  $('#deleteSensorBtn').on('click', function () {
    const selectedSensors = $('.sensorCheckbox:checked').map(function () {
      return $(this).data('id');
    }).get();
  
    if (selectedSensors.length === 0) {
      toastr.warning("Please choose at least one sensor.");
      return;
    }
  
     if(!confirm(`Are you sure you want to delete ${selectedSensors.length} sensor${selectedSensors.length > 1 ? 's' : ''}?`)) return;
  
    $.ajax({
      url: '/api/sensor/delete',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ sensorIds: selectedSensors }),
      success: function (res) {
        toastr.success(res.message)
        getSensors();
        $('#selectAll').prop('checked', false);
      },
      error: function (error) {
        toastr.error(error.responseJSON?.message || "Delete failed")
      }
    });
  });
});

function generateRow(sensor) {
  return `
    <tr data-id="${sensor._id}">
      <td class="t_center"><input type="checkbox" class="sensorCheckbox" data-id="${sensor._id}"></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="name" value="${sensor.name}" /></td>
      <td><input type="text" class="dataInput border-0" style="width:100%" data-field="description" value="${sensor.description}" /></td>
    </tr>
  `;
}