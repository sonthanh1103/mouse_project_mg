toastr.options = {
  escapeHtml: false,
  closeButton: true,
  timeOut: 200,
  positionClass: 'toast-top-right'
};

$(document).ready(function () {
  $('#productTable').DataTable({
    order: [],
    ajax: {
      url: '/api/product/get',
      dataSrc: 'data'
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
      { data: 'name' },
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

async function addProduct() {
  document.getElementById('addProductBtn').addEventListener('click', async () => {
      try {
          const response = await fetch('/api/product/create', {
            method: 'POST',
            headers: {"Content-Type" : "application/json"}
          } );  
          const result = await response.json();
          if (!response.ok) {
            toastr.error(result.message);
            return;
          }
          toastr.success(result.message)
      } catch (error) {
          toastr.error("Create erron: " + error.message);
      }
  });
}


function updateProduct() {
  document.getElementById('productTableBody').addEventListener('change', async (event) => {
    const input = event.target;

    if (input.classList.contains('dataInput')) {
      const row = input.closest('tr');
      const id = row.getAttribute('data-id');

      const inputs = row.querySelectorAll('.dataInput');
      const updatedData = {}; 
      inputs.forEach(inp => {
        const field = inp.getAttribute('data-field');
        updatedData[field] = inp.value; 
      });

      try {
        const response = await fetch(`/api/product/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(updatedData)
        });

        const result = await response.json();
        if (!response.ok) {
          toastr.error(result.message);
          return;
        }

        console.log('Cập nhật thành công', result);
      } catch (error) {
        toastr.error( error.message);
      }
    }
  });
}

const selectAll = document.getElementById('selectAll');
    selectAll.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.productCheckbox');
        checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    })
// selectAll?.addEventListener('change', selectAll);


document.getElementById('deleteProductBtn')?.addEventListener('click', deleteProducts);


async function deleteProducts() {
    const selectedProducts = [...document.querySelectorAll('.productCheckbox:checked')].map(cb => cb.dataset.id);

    if (selectedProducts.length === 0) {
        toastr.warning("Please choose at least one product.");
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch('/api/product/delete', {
          method: 'POST',
          headers: {"Content-Type" : "application/json"},
          body: JSON.stringify({ productIds: selectedProducts })
        })

        const data = await response.json();
            if (!response.ok) {
              toastr.error(data.message);
              return;
            }
            toastr.success(data.message);
            await getAllProducts();
            selectAll.checked = false;
    } catch (error) {
        toastr.error(error.message);
    }
}





function generateRow(product) {
  return `
  <tr data-id="${product._id}">
    <td class="text-center"><input type="checkbox" class="productCheckbox" data-id="${product._id}"/></td>
    <td><input type="text" class="dataInput" data-field="name" value="${product.name}"/></td>
    <td><input type="text" class="dataInput" data-field="length" value="${product.length}"/></td>
    <td><input type="text" class="dataInput" data-field="width" value="${product.width}"/></td>
    <td><input type="text" class="dataInput" data-field="height" value="${product.height}"/></td>
    <td><input type="text" class="dataInput" data-field="weight" value="${product.weight}"/></td>
    <td><input type="text" class="dataInput" data-field="shape" value="${product.shape}"/></td>
    <td><input type="text" class="dataInput" data-field="hump_placement" value="${product.hump_placement}"/></td>
    <td><input type="text" class="dataInput" data-field="front_flare" value="${product.front_flare}"/></td>
    <td><input type="text" class="dataInput" data-field="side_curvature" value="${product.side_curvature}"/></td>
    <td><input type="text" class="dataInput" data-field="hand_compatibility" value="${product.hand_compatibility}"/></td>
    <td><input type="text" class="dataInput" data-field="thumb_rest" value="${product.thumb_rest}"/></td>
    <td><input type="text" class="dataInput" data-field="ring_finger_rest" value="${product.ring_finger_rest}"/></td>
    <td><input type="text" class="dataInput" data-field="material" value="${product.material}"/></td>
    <td><input type="text" class="dataInput" data-field="connectivity" value="${product.connectivity}"/></td>
    <td><input type="text" class="dataInput" data-field="sensor" value="${product.sensor}"/></td>
    <td><input type="text" class="dataInput" data-field="sensor_technology" value="${product.sensor_technology}"/></td>
    <td><input type="text" class="dataInput" data-field="sensor_position" value="${product.sensor_position}"/></td>
    <td><input type="text" class="dataInput" data-field="dpi" value="${product.dpi}"/></td>
    <td><input type="text" class="dataInput" data-field="polling_rate" value="${product.polling_rate}"/></td>
    <td><input type="text" class="dataInput" data-field="tracking_speed" value="${product.tracking_speed}"/></td>
    <td><input type="text" class="dataInput" data-field="acceleration" value="${product.acceleration}"/></td>
    <td><input type="text" class="dataInput" data-field="side_buttons" value="${product.side_buttons}"/></td>
    <td><input type="text" class="dataInput" data-field="middle_buttons" value="${product.middle_buttons}"/></td>
  </tr>
  `;
}

