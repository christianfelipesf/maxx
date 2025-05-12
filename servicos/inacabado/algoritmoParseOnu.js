function parseONUData(data) {
    const lines = data.split('\n');
    let formattedData = {};
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      if (line.includes('MAC ONU')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.includes('\t')) {
          const [mac, olt, slot, pon, status] = nextLine.split('\t');
          formattedData = { MAC: mac, OLT: olt, SLOT: slot, PON: pon, STATUS: status };
          i++;
        }
      } else if (line.includes('ADMINSTATE')) {
        const headers = line.split('\t');
        const values = lines[i + 1]?.split('\t');
        if (values && values.length === headers.length) {
          headers.forEach((header, index) => {
            formattedData[header.trim()] = values[index].trim();
          });
          i++;
        }
      } else if (line.includes(':\t')) {
        const [key, value] = line.split(':\t');
        if (key && value) {
          formattedData[key.trim()] = value.trim();
        }
      }
    }
    return formattedData;
  }
let data = `MAC ONU	OLT	SLOT	PON	STATUS PON
FHTT923D2888	SANTA-RITA-1	2	8	UP		
ADMINSTATE	OPERSTATE	DOWNLOAD	UPLOAD	RX ONU	TX ONU	RX OLT
UP	UP	102400	30720	-22,07	2,51	-26.38
Configuração IP
IP ONU:	100.64.112.246
DNS 1:	201.76.128.43
DNS 2:	201.76.128.34
ID do Equipamento:	AN5506-04-FG
Versão do Software:	RP2643
 Informações Adicionais
Tempo ligado:	3 dia(s) 06h 24m 42s
Distância(M):	14.051
Corrente(mA):	17,75
Temperatura(°C):	53,00
Tensão(V):	3,28`

console.log(parseONUData(data))