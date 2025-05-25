$(function () {
  const FIELDS = [
    "length",
    "width",
    "height",
    "weight",
    "shape",
    "hump_placement",
    "front_flare",
    "side_curvature",
    "hand_compatibility",
    "thumb_rest",
    "ring_finger_rest",
    "material",
    "connectivity",
    "sensor",
    "sensor_technology",
    "sensor_position",
    "dpi",
    "polling_rate",
    "tracking_speed",
    "acceleration",
    "side_buttons",
    "middle_buttons",
  ];

  const $searchBox = $("#searchBox");
  const $searchSuggestions = $("#searchSuggestions");

  // Sử dụng container mới cho tiêu đề và hiển thị chuột
  const $miceSelectionContainer = $("#miceSelectionContainer");
  const $miceDisplay = $("#miceDisplay");

  const $singleView = $("#singleProductView");
  const $singleProductLegend = $("#singleProductLegend");
  const $singleOutlinesWrap = $("#singleOutlinesWrap");
  const $singleProductTable = $("#singleProductTable");

  const $compareWrap = $("#compareTableWrap");
  const $legendCol = $("#legendCol");
  const $outlinesWrap = $("#outlinesWrap");
  const $compareTable = $("#compareTable");

  let allProducts = [];
  let initialCards = [];
  let compareList = []; // Mảng chứa IDs của các sản phẩm đang so sánh

  // Map để lưu màu của từng sản phẩm
  const colorMap = {};

  // Helper function to create a styled SVG wrapper
  function createStyledSvgWrapper(rawSvgContent, color) {
    let contentHtml = '';

    if (!rawSvgContent || rawSvgContent.trim() === '') {
      contentHtml = '<div class="no-svg-placeholder text-muted small text-center w-100 h-100 d-flex align-items-center justify-content-center"></div>';
    } else {
      const $svgElement = $(rawSvgContent).filter('svg');
      if ($svgElement.length) {
        $svgElement.attr({
          preserveAspectRatio: 'xMidYMid meet',
          width: '100%',
          height: '100%',
          stroke: color,
          'stroke-width': 2,
          fill: 'none',
        }).css('display', 'block').css({
          margin: 'auto',
          'max-width': '100%',
          'max-height': '100%',
          'object-fit': 'contain'
        });
        contentHtml = $('<div>').append($svgElement).html();
      } else if (/^(https?:\/\/|\/)\S+/.test(rawSvgContent)) {
        contentHtml = `<img src="${rawSvgContent}" alt="Mouse image" style="width:100%; height:100%; object-fit:contain;">`;
      } else {
        contentHtml = '<div class="no-svg-placeholder text-muted small text-center w-100 h-100 d-flex align-items-center justify-content-center">Invalid SVG</div>';
      }
    }
    return `<div class="overlay-svg">${contentHtml}</div>`;
  }

  // Load toàn bộ sản phẩm và lấy 27 đầu làm initial
  $.getJSON("/api/product/suggested").done((res) => {
    if (!res.success) {
      console.error("Failed to load products:", res.message);
      return;
    }
    allProducts = res.data;
    initialCards = allProducts.slice(0, 27);
    updateCompareView();
  }).fail((jqXHR, textStatus, errorThrown) => {
    console.error("AJAX Error loading products:", textStatus, errorThrown);
  });

  $searchBox.on("blur", () => {
    setTimeout(() => $searchSuggestions.hide(), 150);
  });

  $searchBox.on("input", debounce(function () {
    const q = this.value.trim();
    if (q.length > 0) {
      $.getJSON("/api/product/search", { q }).done((res) => {
        if (res.success) {
          renderDropdown(res.data);
          $searchSuggestions.show();
        } else {
          console.error("Search API failed:", res.message);
          $searchSuggestions.empty().append('<div class="list-group-item text-muted">Error searching</div>').show();
        }
      }).fail(() => {
        console.error("AJAX error during search.");
        $searchSuggestions.empty().append('<div class="list-group-item text-muted">Network error</div>').show();
      });
    } else {
      renderDropdown(allProducts);
      $searchSuggestions.show();
    }
  }));

  $searchBox.on("focus", () => {
    renderDropdown(allProducts);
    $searchSuggestions.show();
  });

  function renderDropdown(items) {
    $searchSuggestions.empty();
    if (!items.length) {
      return $searchSuggestions.append('<div class="list-group-item text-muted">No results</div>');
    }
    items.forEach(p => {
      const brandName = p.brand?.name || '';
      const badge = p.isNew ? '<span class="badge-new">NEW</span>' : '';
      $searchSuggestions.append(`
        <div class="list-group-item d-flex align-items-center justify-content-between" data-id="${p._id}">
          <div class="d-flex align-items-center">
            ${brandName ? `<span>${brandName}</span>&nbsp;` : ''}${p.name}
          </div>
          ${badge}
        </div>
      `);
    });
  }

  $searchSuggestions.on("click", ".list-group-item", function () {
    const id = $(this).data("id");
    if (!compareList.includes(id)) compareList.push(id);
    $searchBox.val("");
    $searchSuggestions.hide();
    updateCompareView();
  });

  function renderMiceDisplay(items, isClickable = true) {
    $miceDisplay.empty();
    items.forEach(p => {
      const thumbContent = !isClickable && p.svg1
        ? (p.svg1.trim().startsWith('<svg') ? p.svg1 : `<img src="${p.svg1}" alt="Mouse image" style="width:100%; height:100%; object-fit:contain;">`)
        : '';
      const thumbHtml = thumbContent ? `<div class="svg-thumb" style="width:50px; height:50px;">${thumbContent}</div>` : '';
      const brand = p.brand?.name || '';
      $miceDisplay.append(`
        <div class="card p-2 m-2 text-center" data-id="${p._id}" style="width:120px; ${isClickable ? 'cursor:pointer;' : ''}">
          ${thumbHtml}<div class="small text-truncate mt-1">${brand}<br><strong>${p.name}</strong></div>
        </div>
      `);
    });
    $miceDisplay.off("click", ".card");
    if (isClickable) {
      $miceDisplay.on("click", ".card", function () {
        const id = $(this).data("id");
        if (!compareList.includes(id)) compareList.push(id);
        updateCompareView();
      });
    }
  }

  function updateCompareView() {
    $miceSelectionContainer.hide();
    $singleView.hide();
    $compareWrap.hide();
    $legendCol.empty();
    $singleProductLegend.empty();

    if (compareList.length === 0) {
      $miceSelectionContainer.show().find('h4').text('Select Mice to compare');
      renderMiceDisplay(initialCards, true);
    } else if (compareList.length === 1) {
      const id = compareList[0];
      $singleView.show();
      if (!colorMap[id]) colorMap[id] = getRandomColor();
      loadCompare(compareList).done(products => {
        if (products.length) {
          const singleProduct = products[0];
          showSingle(singleProduct, colorMap[id]);
          showSingleProductLegend(singleProduct, colorMap[id]);
        }
      });
    } else {
      compareList.forEach(id => { if (!colorMap[id]) colorMap[id] = getRandomColor(); });
      const selected = allProducts.filter(p => compareList.includes(p._id));
      $compareWrap.show();
      renderMiceDisplay(selected, false);
      loadCompare(compareList).done(products => {
        showCompare(products);
        showMultiProductLegend(products);
      });
    }
  }

  function loadCompare(ids) {
    return $.ajax({
      url: "/api/product/compare",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ productIds: ids }),
      dataType: "json",
    }).then(res => res.success ? res.data : []).fail(() => []);
  }

  function showSingle(p, color) {
    $singleOutlinesWrap.empty()
      .append($(createStyledSvgWrapper(p.svg1, color)))
      .append($(createStyledSvgWrapper(p.svg2 || p.svgOutline, color)));
    const rows = FIELDS.map(f => {
      let val = p[f];
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      else if (val && typeof val === 'object') val = val.name || JSON.stringify(val);
      else val = val ?? '-';
      return `<tr><th>${capitalizeFirst(f.replace(/_/g, " "))}</th><td>${val}</td></tr>`;
    }).join('');
    $singleProductTable.html(`<thead class="table-dark"><tr><th></th><th>Value</th></tr></thead><tbody>${rows}</tbody>`);
  }

  function showSingleProductLegend(p, color) {
    $singleProductLegend.empty().append(`
      <div class="d-flex align-items-center bg-dark p-2 mb-2 rounded" style="color: ${color}; border: 2px solid ${color};">
        <div class="color-dot me-2" style="background-color: ${color};"></div>
        <div class="flex-grow-1 text-start">
          <span>${p.brand?.name||''}</span><br>
          <small>${p.name}</small><br>
          <small>${p.length||'-'} * ${p.width||'-'} * ${p.height||'-'} mm ${p.weight||'-'}g</small>
        </div>
        <button type="button" class="btn-close ms-2" data-id="${p._id}"></button>
      </div>
    `);
    $singleProductLegend.off('click').on('click', '.btn-close', () => { compareList = []; updateCompareView(); });
  }

  function showCompare(products) {
    $outlinesWrap.empty();
    const $front = $('<div class="front-container"></div>');
    const $side  = $('<div class="side-container"></div>');
    products.forEach(p => {
      const color = colorMap[p._id];
      $front.append($(createStyledSvgWrapper(p.svg1, color)));
      $side.append($(createStyledSvgWrapper(p.svg2||p.svgOutline, color)));
    });
    $outlinesWrap.append($front, $side);
    let thead = `<thead class="table-dark"><tr><th></th>`;
    products.forEach(p => thead += `<th>${p.brand?.name||''}<br><small>${p.name}</small></th>`);
    thead += `</tr></thead>`;
    const base = products[0];
    const pct = (b, v) => (typeof b==='number'&&typeof v==='number'&&b?((v-b)/b*100).toFixed(0)+'%':'');
    let tbody = '<tbody>';
    FIELDS.forEach(f => {
      tbody += `<tr><th>${capitalizeFirst(f.replace(/_/g, " "))}</th>`;
      products.forEach((p,j) => {
        let val = p[f];
        if (typeof val==='boolean') val=val?'Yes':'No';
        else if(val&&typeof val==='object') val=val.name||JSON.stringify(val);
        else val=val??'-';
        let diff = '';
        if(j>0){ const d=pct(base[f],p[f]); if(d) diff=` <small class="${d.startsWith('-')?'text-danger':'text-success'}">(${d})</small>`; }
        tbody += `<td>${val}${diff}</td>`;
      });
      tbody += '</tr>';
    });
    tbody += '</tbody>';
    $compareTable.html(thead + tbody).addClass('table-dark');
  }

function showMultiProductLegend(products) {
    $legendCol.empty();
    products.forEach(p => {
      const c = colorMap[p._id];
      $legendCol.append(`
        <div class="d-flex align-items-center bg-dark p-2 mb-2 rounded" style="color: ${c}; border: 2px solid ${c};">
          <div class="color-dot me-2" style="background-color: ${c};"></div>
          <div class="flex-grow-1 text-start">
            <span>${p.brand?.name||''}</span><br>
            <small>${p.name}</small><br>
            <small>${p.length||'-'} * ${p.width||'-'} * ${p.height||'-'} mm ${p.weight||'-'}g</small>
          </div>
          <button type="button" class="btn-close ms-2" data-id="${p._id}"></button>
        </div>
      `);
    });
    $legendCol.off('click').on('click', '.btn-close', function() {
      const id = $(this).data('id');
      compareList = compareList.filter(i => i !== id);
      updateCompareView();
    });
  }
});