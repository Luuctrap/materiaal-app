import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, QrCode } from "lucide-react";
import QrReader from "react-qr-reader";

export default function MateriaalApp() {
  const [klussen, setKlussen] = useState([]);
  const [huidigeKlus, setHuidigeKlus] = useState("");
  const [materiaal, setMateriaal] = useState("");
  const [aantal, setAantal] = useState(1);
  const [scannen, setScannen] = useState(false);

  const voegKlusToe = () => {
    if (!huidigeKlus) return;
    setKlussen([...klussen, { naam: huidigeKlus, materialen: [] }]);
    setHuidigeKlus("");
  };

  const voegMateriaalToe = (klusIndex) => {
    const nieuweKlussen = [...klussen];
    nieuweKlussen[klusIndex].materialen.push({ naam: materiaal, aantal });
    setKlussen(nieuweKlussen);
    setMateriaal("");
    setAantal(1);
  };

  const verwerkQR = async (data) => {
    if (data) {
      setScannen(false);
      try {
        if (data.startsWith("http") && data.includes("indi")) {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(data)}`);
          const result = await response.json();
          const parser = new DOMParser();
          const doc = parser.parseFromString(result.contents, "text/html");
          const title = doc.querySelector("title")?.textContent || data;
          setMateriaal(title);
        } else {
          setMateriaal(data);
        }
      } catch (err) {
        console.error("Fout bij ophalen productinfo:", err);
        setMateriaal(data);
      }
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Materiaalregistratie per Klus</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Nieuwe klusnaam"
          value={huidigeKlus}
          onChange={(e) => setHuidigeKlus(e.target.value)}
        />
        <Button onClick={voegKlusToe}>
          <PlusCircle className="mr-2" /> Voeg klus toe
        </Button>
      </div>

      {klussen.map((klus, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">🧰 {klus.naam}</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Materiaal of QR-code invoer"
                value={materiaal}
                onChange={(e) => setMateriaal(e.target.value)}
              />
              <Input
                type="number"
                min={1}
                value={aantal}
                onChange={(e) => setAantal(Number(e.target.value))}
                className="w-20"
              />
              <Button onClick={() => voegMateriaalToe(index)}>
                <PlusCircle className="mr-2" /> Voeg toe
              </Button>
              <Button variant="outline" onClick={() => setScannen(true)}>
                <QrCode className="mr-2" /> Scan QR
              </Button>
            </div>

            {scannen && (
              <div className="mt-2 border p-2 rounded">
                <QrReader
                  delay={300}
                  onError={(err) => console.error(err)}
                  onScan={verwerkQR}
                  style={{ width: "100%" }}
                />
                <Button className="mt-2" onClick={() => setScannen(false)}>
                  Stop scannen
                </Button>
              </div>
            )}

            <ul className="list-disc list-inside">
              {klus.materialen.map((mat, i) => (
                <li key={i}>{mat.naam} – {mat.aantal} stuks</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
