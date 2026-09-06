// Coordenadas: Centrado entre Chillán y Concepción
const MAP_CENTER = [-36.7, -72.6];
const MAP_ZOOM = 9;
const COLORS = { supermercado: '#38BDF8', distribuidora: '#FBBF24' };

// Fotos
const f1 = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=300&q=80"; 
const f2 = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80";
const f3 = "https://images.unsplash.com/photo-1588964895597-cfccd6e2a09f?auto=format&fit=crop&w=300&q=80";
const f4 = "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=300&q=80";
const f5 = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80";

const clientes = [
    { id: 1, nombre: "Distribuidora La Torre", tipo: "distribuidora", lat: -36.602, lng: -72.098, visitado: false, volumen: 100, riesgoQuiebre: true, ciudad: "Chillán", foto: f1 },
    { id: 2, nombre: "Distribuidora El Leo", tipo: "distribuidora", lat: -36.620, lng: -72.115, visitado: true, volumen: 85, riesgoQuiebre: false, ciudad: "Chillán Viejo", foto: f2 },
    { id: 3, nombre: "Supermercado Jumbo", tipo: "supermercado", lat: -36.612, lng: -72.105, visitado: true, volumen: 60, riesgoQuiebre: false, ciudad: "Chillán", foto: f3 },
    { id: 7, nombre: "Supermercado Lider", tipo: "supermercado", lat: -36.605, lng: -72.090, visitado: true, volumen: 55, riesgoQuiebre: false, ciudad: "Chillán", foto: f4 },
    { id: 4, nombre: "Mayorista 10", tipo: "distribuidora", lat: -36.820, lng: -72.330, visitado: false, volumen: 75, riesgoQuiebre: true, ciudad: "Cabrero", foto: f5 },
    { id: 5, nombre: "Supermercado Unimarc", tipo: "supermercado", lat: -37.470, lng: -72.350, visitado: false, volumen: 40, riesgoQuiebre: false, ciudad: "Los Ángeles", foto: f3 },
    { id: 6, nombre: "Central Mayorista", tipo: "distribuidora", lat: -37.475, lng: -72.340, visitado: true, volumen: 90, riesgoQuiebre: false, ciudad: "Los Ángeles", foto: f1 },
    { id: 8, nombre: "Distribuidora RABIE", tipo: "distribuidora", lat: -36.826, lng: -73.050, visitado: true, volumen: 110, riesgoQuiebre: false, ciudad: "Concepción", foto: f2 },
    { id: 9, nombre: "Supermercado Santa Isabel", tipo: "supermercado", lat: -36.821, lng: -73.045, visitado: false, volumen: 45, riesgoQuiebre: true, ciudad: "Concepción", foto: f4 },
    { id: 10, nombre: "Mayorista Ganga", tipo: "distribuidora", lat: -36.720, lng: -73.110, visitado: false, volumen: 80, riesgoQuiebre: true, ciudad: "Talcahuano", foto: f5 },
    { id: 11, nombre: "Supermercado Versluys", tipo: "supermercado", lat: -36.840, lng: -73.105, visitado: true, volumen: 65, riesgoQuiebre: false, ciudad: "San Pedro de la Paz", foto: f1 },
    { id: 12, nombre: "Alvi Supermercados", tipo: "distribuidora", lat: -36.780, lng: -73.070, visitado: true, volumen: 95, riesgoQuiebre: false, ciudad: "Hualpén", foto: f2 }
];

let map, markersLayer = L.layerGroup(), routeLine = null;

function initMap() {
    const googleHybrid = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'] });
    map = L.map('map', { zoomControl: false, layers: [googleHybrid] }).setView(MAP_CENTER, MAP_ZOOM);
    markersLayer.addTo(map);
    renderMarkers();
    updateKPIs();
    initMiniChart();
}

function renderMarkers() {
    markersLayer.clearLayers();
    const showDist = document.getElementById('filter-distribuidoras').checked;
    const showSuper = document.getElementById('filter-supermercados').checked;

    clientes.forEach(cliente => {
        if ((cliente.tipo === 'distribuidora' && !showDist) || (cliente.tipo === 'supermercado' && !showSuper)) return;

        const baseRadius = cliente.tipo === 'distribuidora' ? 12 : 8;
        const sizeMultiplier = cliente.volumen / 50; 
        const isRisk = cliente.riesgoQuiebre;
        
        const iconHtml = `<div class="${isRisk ? 'marker-risk' : ''}" style="width: ${baseRadius * sizeMultiplier}px; height: ${baseRadius * sizeMultiplier}px; background-color: ${COLORS[cliente.tipo]}; border: 2px solid white; border-radius: 50%; opacity: 0.95; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>`;
        
        const customIcon = L.divIcon({
            html: iconHtml, className: '', 
            iconSize: [baseRadius * sizeMultiplier, baseRadius * sizeMultiplier],
            iconAnchor: [(baseRadius * sizeMultiplier)/2, (baseRadius * sizeMultiplier)/2]
        });

        const marker = L.marker([cliente.lat, cliente.lng], { icon: customIcon });
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 220px; max-width: 260px;">
                <div style="width: 100%; height: 120px; border-radius: 6px; overflow: hidden; margin-bottom: 10px; position: relative;">
                    <img src="${cliente.foto}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${isRisk ? '<div style="position: absolute; top: 5px; right: 5px; background: #EF4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">¡ALERTA!</div>' : ''}
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 14px;">${cliente.nombre}</h4>
                <p style="margin: 0; font-size: 11px; color: #94A3B8;">📍 ${cliente.ciudad} | 📦 Vol: ${cliente.volumen}</p>
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between;">
                    <p style="margin:0; font-size:11px;"><strong>Estado:</strong><br/> ${cliente.visitado ? '<span style="color:#10B981;">✓ Visitado</span>' : '<span style="color:#EF4444;">✗ Pendiente</span>'}</p>
                    <p style="margin:0; font-size:11px; text-align:right;"><strong>Riesgo Quiebre:</strong><br/> ${cliente.riesgoQuiebre ? '<span style="color:#EF4444; font-weight:bold;">ALTO</span>' : 'Bajo'}</p>
                </div>
            </div>
        `;
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
    });
}

function updateKPIs() {
    const total = clientes.length;
    const visitados = clientes.filter(c => c.visitado).length;
    const riesgos = clientes.filter(c => c.riesgoQuiebre).length;
    const cumplimiento = Math.round((visitados / total) * 100);
    document.getElementById('kpi-compliance').textContent = `${cumplimiento}%`;
    document.querySelector('.progress').style.width = `${cumplimiento}%`;
    document.getElementById('kpi-inactive').textContent = riesgos;
}

function initMiniChart() {
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.borderColor = '#334155';
    new Chart(document.getElementById('mini-chart-cobertura').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            datasets: [{ label: 'Avance Semanal', data: [100, 95, 80, 45, 0], backgroundColor: '#3B82F6', borderRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { display: false, max: 100 }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// ----------------------------------------------------------------
// Mobile UI Logic (Bottom Navigation, Drawers & Sheets)
// ----------------------------------------------------------------

function toggleDrawer() {
    document.getElementById('lateral-menu').classList.toggle('open');
    document.getElementById('overlay-menu').classList.toggle('active');
}
function closeDrawer() {
    document.getElementById('lateral-menu').classList.remove('open');
    document.getElementById('overlay-menu').classList.remove('active');
}

function closeAllSheets() {
    document.querySelectorAll('.bottom-sheet').forEach(sheet => sheet.classList.remove('open'));
}

function openSheet(id) {
    closeAllSheets();
    document.getElementById(id).classList.add('open');
}

function activateNav(targetBtn) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    targetBtn.classList.add('active');
}

function simularGeocerca() {
    closeDrawer();
    const target = clientes.find(c => c.nombre === "Distribuidora El Leo");
    const alertBox = document.getElementById('geofence-alert');
    map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1.5 });

    setTimeout(() => {
        document.getElementById('geofence-client').textContent = target.nombre;
        alertBox.classList.remove('hidden');
        let circle = L.circle([target.lat, target.lng], { color: '#10B981', fillOpacity: 0.3, radius: 150 }).addTo(map);

        setTimeout(() => {
            alertBox.classList.add('hidden');
            map.removeLayer(circle);
            map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true, duration: 1.5 });
        }, 3500);
    }, 1600);
}

function trazarRutaOptima() {
    const routeClients = [
        clientes.find(c => c.nombre === "Distribuidora La Torre"),
        clientes.find(c => c.nombre === "Distribuidora El Leo"),
        clientes.find(c => c.nombre === "Mayorista 10"),
        clientes.find(c => c.nombre === "Distribuidora RABIE"),
        clientes.find(c => c.nombre === "Mayorista Ganga")
    ];
    const latlngs = routeClients.map(c => [c.lat, c.lng]);
    if(routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(latlngs, { color: '#3B82F6', weight: 5, opacity: 0.8, dashArray: '10,10', lineJoin: 'round' }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Drawer Listeners
    document.getElementById('btn-menu').addEventListener('click', toggleDrawer);
    document.getElementById('btn-close-menu').addEventListener('click', closeDrawer);
    document.getElementById('overlay-menu').addEventListener('click', closeDrawer);
    document.getElementById('filter-distribuidoras').addEventListener('change', renderMarkers);
    document.getElementById('filter-supermercados').addEventListener('change', renderMarkers);
    document.getElementById('btn-geocerca').addEventListener('click', simularGeocerca);

    // Bottom Navigation Listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.target;
            activateNav(btn);
            
            if (target === 'map') {
                closeAllSheets();
                if(routeLine) map.removeLayer(routeLine);
                map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true, duration: 1 });
            } else if (target === 'sheet-kpis') {
                openSheet('sheet-kpis');
            } else if (target === 'sheet-route') {
                trazarRutaOptima();
                openSheet('sheet-route');
            }
        });
    });

    // Close buttons on sheets
    document.querySelectorAll('.btn-close-sheet').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllSheets();
            activateNav(document.querySelector('.nav-item[data-target="map"]'));
            if(routeLine) map.removeLayer(routeLine);
            map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true, duration: 1 });
        });
    });
    
    // FAB Location Button (Mock)
    document.getElementById('btn-location').addEventListener('click', () => {
        map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true, duration: 1 });
    });
});
