// Coordenadas: Centrado entre Chillán y Concepción
const MAP_CENTER = [-36.7, -72.6];
const MAP_ZOOM = 9;

const COLORS = { supermercado: '#38BDF8', distribuidora: '#FBBF24' };

const fotoFachada1 = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=300&q=80"; 
const fotoFachada2 = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80";
const fotoFachada3 = "https://images.unsplash.com/photo-1588964895597-cfccd6e2a09f?auto=format&fit=crop&w=300&q=80";
const fotoFachada4 = "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=300&q=80";
const fotoFachada5 = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80";

const clientes = [
    { id: 1, nombre: "Distribuidora La Torre", tipo: "distribuidora", lat: -36.602, lng: -72.098, visitado: false, volumen: 100, riesgoQuiebre: true, ciudad: "Chillán", foto: fotoFachada1 },
    { id: 2, nombre: "Distribuidora El Leo", tipo: "distribuidora", lat: -36.620, lng: -72.115, visitado: true, volumen: 85, riesgoQuiebre: false, ciudad: "Chillán Viejo", foto: fotoFachada2 },
    { id: 3, nombre: "Supermercado Jumbo", tipo: "supermercado", lat: -36.612, lng: -72.105, visitado: true, volumen: 60, riesgoQuiebre: false, ciudad: "Chillán", foto: fotoFachada3 },
    { id: 7, nombre: "Supermercado Lider", tipo: "supermercado", lat: -36.605, lng: -72.090, visitado: true, volumen: 55, riesgoQuiebre: false, ciudad: "Chillán", foto: fotoFachada4 },
    { id: 4, nombre: "Mayorista 10", tipo: "distribuidora", lat: -36.820, lng: -72.330, visitado: false, volumen: 75, riesgoQuiebre: true, ciudad: "Cabrero", foto: fotoFachada5 },
    { id: 5, nombre: "Supermercado Unimarc", tipo: "supermercado", lat: -37.470, lng: -72.350, visitado: false, volumen: 40, riesgoQuiebre: false, ciudad: "Los Ángeles", foto: fotoFachada3 },
    { id: 6, nombre: "Central Mayorista", tipo: "distribuidora", lat: -37.475, lng: -72.340, visitado: true, volumen: 90, riesgoQuiebre: false, ciudad: "Los Ángeles", foto: fotoFachada1 },
    { id: 8, nombre: "Distribuidora RABIE", tipo: "distribuidora", lat: -36.826, lng: -73.050, visitado: true, volumen: 110, riesgoQuiebre: false, ciudad: "Concepción", foto: fotoFachada2 },
    { id: 9, nombre: "Supermercado Santa Isabel", tipo: "supermercado", lat: -36.821, lng: -73.045, visitado: false, volumen: 45, riesgoQuiebre: true, ciudad: "Concepción", foto: fotoFachada4 },
    { id: 10, nombre: "Mayorista Ganga", tipo: "distribuidora", lat: -36.720, lng: -73.110, visitado: false, volumen: 80, riesgoQuiebre: true, ciudad: "Talcahuano", foto: fotoFachada5 },
    { id: 11, nombre: "Supermercado Versluys", tipo: "supermercado", lat: -36.840, lng: -73.105, visitado: true, volumen: 65, riesgoQuiebre: false, ciudad: "San Pedro de la Paz", foto: fotoFachada1 },
    { id: 12, nombre: "Alvi Supermercados", tipo: "distribuidora", lat: -36.780, lng: -73.070, visitado: true, volumen: 95, riesgoQuiebre: false, ciudad: "Hualpén", foto: fotoFachada2 }
];

let map;
let markersLayer = L.layerGroup();
let chartInstance = null;
let routeLine = null;

function initMap() {
    const googleHybrid = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'], attribution: 'Map data &copy; Google'
    });
    const googleSat = L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'], attribution: 'Map data &copy; Google'
    });

    map = L.map('map', { zoomControl: false, layers: [googleHybrid] }).setView(MAP_CENTER, MAP_ZOOM);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseMaps = { "Google Híbrido": googleHybrid, "Google Satélite": googleSat };
    L.control.layers(baseMaps, null, { position: 'bottomleft' }).addTo(map);

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
        const markerColor = COLORS[cliente.tipo];
        const isRisk = cliente.riesgoQuiebre;

        const iconHtml = `
            <div class="${isRisk ? 'marker-risk' : ''}" style="
                width: ${baseRadius * sizeMultiplier}px; height: ${baseRadius * sizeMultiplier}px;
                background-color: ${markerColor}; border: 2px solid white; border-radius: 50%; opacity: 0.95;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
        `;
        const customIcon = L.divIcon({
            html: iconHtml, className: '', 
            iconSize: [baseRadius * sizeMultiplier, baseRadius * sizeMultiplier],
            iconAnchor: [(baseRadius * sizeMultiplier)/2, (baseRadius * sizeMultiplier)/2]
        });

        const marker = L.marker([cliente.lat, cliente.lng], { icon: customIcon });
        const popupContent = `
            <div class="custom-popup" style="font-family: 'Inter', sans-serif; min-width: 220px; max-width: 250px;">
                <div style="width: 100%; height: 120px; border-radius: 6px; overflow: hidden; margin-bottom: 10px; position: relative;">
                    <img src="${cliente.foto}" style="width: 100%; height: 100%; object-fit: cover;" alt="Fachada del Local">
                    ${isRisk ? '<div style="position: absolute; top: 5px; right: 5px; background: #EF4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">¡ALERTA!</div>' : ''}
                </div>
                <h4 style="margin: 0 0 4px 0; color: #F8FAFC; font-size: 15px;">${cliente.nombre}</h4>
                <p style="margin: 0; font-size: 12px; color: #94A3B8;">📍 ${cliente.ciudad} &nbsp;&nbsp;|&nbsp;&nbsp; 📦 Vol: ${cliente.volumen}</p>
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <p style="margin: 0; font-size: 12px;"><strong>Estado:</strong><br/> ${cliente.visitado ? '<span style="color:#10B981;">✓ Visitado hoy</span>' : '<span style="color:#EF4444;">✗ Pendiente</span>'}</p>
                    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Riesgo Quiebre:</strong><br/> ${cliente.riesgoQuiebre ? '<span style="color:#EF4444; font-weight:bold;">ALTO</span>' : 'Bajo'}</p>
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
    const ctx = document.getElementById('mini-chart-cobertura').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            datasets: [{ label: 'Avance Ruta Semanal', data: [100, 95, 80, 45, 0], backgroundColor: '#3B82F6', borderRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { display: false, max: 100 }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

function simularGeocerca() {
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

function simularBalanceoRutas() {
    const routeClients = [
        clientes.find(c => c.nombre === "Distribuidora La Torre"), // Chillán
        clientes.find(c => c.nombre === "Distribuidora El Leo"), // Chillán Viejo
        clientes.find(c => c.nombre === "Mayorista 10"), // Cabrero
        clientes.find(c => c.nombre === "Distribuidora RABIE"), // Concepción
        clientes.find(c => c.nombre === "Mayorista Ganga") // Talcahuano
    ];

    const latlngs = routeClients.map(c => [c.lat, c.lng]);

    if(routeLine) map.removeLayer(routeLine);

    routeLine = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10',
        lineJoin: 'round'
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    document.getElementById('route-panel').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('filter-distribuidoras').addEventListener('change', renderMarkers);
    document.getElementById('filter-supermercados').addEventListener('change', renderMarkers);
    
    document.getElementById('btn-geocerca').addEventListener('click', simularGeocerca);
    document.getElementById('btn-balanceo').addEventListener('click', simularBalanceoRutas);
    document.getElementById('btn-close-route').addEventListener('click', () => {
        document.getElementById('route-panel').classList.add('hidden');
        if(routeLine) map.removeLayer(routeLine);
        map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true, duration: 1 });
    });
});
