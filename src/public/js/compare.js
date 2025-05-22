$(function() {
  let compareList = [];

  // Load sản phẩm gợi ý
  $.get('/api/product/suggested', { limit: 9 }, res => {
    if (res.success) renderSuggestions(res.data);
  });

  // Tìm kiếm sản phẩm
  $('#searchBox').on('input', function() {
    const q = this.value.trim();
    if (q.length < 2) return $('#searchSuggestions').empty();
    $.get('/api/product/search', { q, limit: 10 }, res => {
      const $list = $('#searchSuggestions').empty();
      (res.data || []).forEach(p => {
        $list.append(`<button class="list-group-item" data-id="${p._id}">${p.brand.name} – ${p.name}</button>`);
      });
    });
  });

  // Xử lý khi click vào search hoặc suggest
  $('#searchSuggestions, #suggestBox').on('click', 'button, .card', function() {
    const id = $(this).data('id');
    if (!compareList.includes(id)) compareList.push(id);

    if (compareList.length === 1) {
      $.ajax({
        url: '/api/product/compare',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productIds: [id] }),
        success(res) {
          if (res.success && res.data?.length) {
            renderSingleProduct(res.data[0]);
            $('#compareTableWrap').empty();
          }
        }
      });
    } else {
      renderCompareTable();
      $('#singleProductView').empty();
    }
  });

  // Hiển thị 3 sản phẩm mỗi dòng (gợi ý)
  function renderSuggestions(items) {
    const $box = $('#suggestBox').empty();
    for (let i = 0; i < items.length; i += 3) {
      const row = $('<div class="d-flex justify-content-center gap-3 flex-wrap mb-3"></div>');
      const group = items.slice(i, i + 3);
      group.forEach(p => {
        const card = $(`
          <div class="card p-2 cursor-pointer" data-id="${p._id}" style="width: 150px;">
            <div class="card-body p-2 text-center">
              <div class="small mt-2 text-truncate">
                ${p.brand.name}<br><strong>${p.name}</strong>
              </div>
            </div>
          </div>
        `);
        row.append(card);
      });
      $box.append(row);
    }
  }

  // Hiển thị chi tiết 1 sản phẩm
  function renderSingleProduct(product) {
    const fields = [
      'length', 'width', 'height', 'weight', 'shape', 'hump_placement',
      'hand_compatibility', 'thumb_rest', 'ring_finger_rest', 'connectivity',
      'sensor_technology', 'dpi', 'polling_rate', 'tracking_speed', 'acceleration',
      'side_buttons', 'middle_buttons'
    ];

    let html = `
      <div class="card p-3 shadow-sm">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-1">${product.brand.name}</h5>
            <h4 class="mb-0">${product.name}</h4>
          </div>
          <div>
            ${
              product.svg1?.startsWith('<svg')
                ? product.svg1
                : product.svg1
                ? `<img src="${product.svg1}" style="max-width:150px;" alt="${product.name}" />`
                : ''
            }
          </div>
        </div>
        <table class="table table-bordered small">
          <tbody>
            ${fields.map(f => `
              <tr>
                <td><strong>${f.replace(/_/g, ' ')}</strong></td>
                <td>${typeof product[f] === 'boolean' ? (product[f] ? 'Yes' : 'No') : (product[f] ?? '-')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    $('#singleProductView').html(html);
  }

  // Hiển thị bảng so sánh
  function renderCompareTable() {
    if (!compareList.length) return $('#compareTableWrap').empty();
  
    $.ajax({
      url: '/api/product/compare',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ productIds: compareList }),
      success(res) {
        if (!res.success || !Array.isArray(res.data)) return;
        const products = res.data;
  
        // Hiển thị riêng phần SVG
        let svgHtml = `<div class="d-flex justify-content-start gap-4 mb-4">`;
        products.forEach(p => {
          svgHtml += `
            <div class="text-center" style="min-width:150px;">
              <div>${p.svg1?.startsWith('<svg') ? p.svg1 : (p.svg1 ? `<img src="${p.svg1}" style="max-width:150px;" alt="${p.name}" />` : '-')}</div>
              <div class="mt-2 fw-bold">${p.brand.name} – ${p.name}</div>
            </div>
          `;
        });
        svgHtml += `</div>`;
  
        // Hiển thị bảng thông tin sản phẩm (không có ảnh)
        let tableHtml = '<div class="table-responsive"><table class="table table-bordered"><thead>';
        tableHtml += '<tr><th>Attribute</th>' +
          products.map(p => `<th>${p.brand.name} – ${p.name}</th>`).join('') +
          '</tr></thead><tbody>';
  
        const fields = [
          'length','width','height','weight','shape','hump_placement',
          'hand_compatibility','thumb_rest','ring_finger_rest','connectivity',
          'sensor_technology','dpi','polling_rate','tracking_speed','acceleration',
          'side_buttons','middle_buttons'
        ];
  
        fields.forEach(f => {
          tableHtml += '<tr><td><strong>' + f.replace(/_/g, ' ') + '</strong></td>' +
            products.map(p => `<td>${
              typeof p[f] === 'boolean' ? (p[f] ? 'Yes' : 'No') : (p[f] ?? '-')
            }</td>`).join('') +
            '</tr>';
        });
  
        tableHtml += '</tbody></table></div>';
  
        // Gộp phần SVG và bảng thông tin lại
        $('#compareTableWrap').html(svgHtml + tableHtml);
      }
    });
  }
  
});
