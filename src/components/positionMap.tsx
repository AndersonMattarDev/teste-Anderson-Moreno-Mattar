import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button, Spinner } from "react-bootstrap";

//Tipos de dados
interface Equipment {
  id: string;
  name: string;
}

interface EquipmentPosition {
    equipmentId: string;
    positions: {lat: number; lon: number; date: string}[];
}

// Icone personalizado para o marcador
const customIcon = new L.Icon({
    iconUrl: "https://leaftfletjs.com/examples/custom-icons/leaf-red.png",
    iconSize: [25, 41], // tamanho do ícone
    iconAnchor: [12, 41], // ponto do ícone que corresponderá à posição do marcador
});

const EquipmentMap = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [positions, setPositions] = useState<EquipmentPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    //Simulando a busca dos dados 
    setTimeout(() => {
        import("../data/equipment.json").then((data) => setEquipment(data.default));
        import("../data/equipmentPositionHistory.json").then((data) => setPositions(data.default));
        setLoading(false);
    }, 1000);
}, []);

if (loading) {
    return <Spinner animation="border" className="m-3" />;
}  

return (
    <div className="container mt-4">
        <h2 className="mb-3"> Mapa de Equipamentos</h2>
        <MapContainer center={[-19.126536, -42.947756]} zoom={10} style={{height: "500px", width: "100%"}}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {positions.map((pos) => {
                //Ordena as posiçoes pela data (mais recente primeiro)
                const sortedPositions = pos.positions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            //pega a ultima posiçao
            const lastPosition = sortedPositions[0];

            //pega o equipamento correspondente
            const matchedEquipment = equipment.find((eq) => eq.id === pos.equipmentId);

            return lastPosition ? (
                <Marker key={pos.equipmentId} position={[lastPosition.lat, lastPosition.lon]} icon={customIcon}>
                    <Popup>
                       <strong>{matchedEquipment?.name ?? "Equipamento Desconhecido"}</strong> <br />
                       Última posição registrada: {new Date(lastPosition.date).toLocaleString()}                      
                    </Popup>
                </Marker>
            ) : null;
            })}
        </MapContainer>
        <Button 
            variant="primary" 
            className="mt-3" 
            onClick={() => {
            if (positions.length > 0) {
                const firstEquipmentPosition = positions[0];
                const firstPosition = firstEquipmentPosition.positions[0];
                if (firstPosition) {
                    const map = L.map(document.querySelector(".leaflet-container") as HTMLElement);
                    map.setView([firstPosition.lat, firstPosition.lon], 15);
                }
            }
            }}
        >
            Ir para o primeiro equipamento
        </Button>
    </div>
 );
};

export default EquipmentMap;