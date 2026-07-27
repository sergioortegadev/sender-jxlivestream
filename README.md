# Jx Live Stream - Sender

### Desarrollado por sergioortegadev

#### Aplicación emisora del stream.

Captura audio desde un archivo MP3 (modo desarrollo) o desde FFmpeg (Linux / Windows) y lo envía al Backend mediante HTTP.

## Modos

| MODE | Descripción                                            |
| ---- | ------------------------------------------------------ |
| 0    | Archivo MP3 (pruebas local antes de configurar mezcla) |
| 1    | OBS + Linux                                            |
| 2    | OBS + Windows                                          |

## Variables de entorno

```env
# 0 = archivo mp3 (desarrollo)
# 1 = Linux
# 2 = Windows
MODE=0

SERVER_URL=http://localhost:8000/publish


MP3_FILE=./media/audio.mp3

LINUX_DEVICE=default o LINUX_DEVICE=alsa_output.pci-0000_00_1b.0.analog-stereo.monitor

WINDOWS_DEVICE=Microphone

BITRATE=64000

CHUNK_SIZE=4096

# Mono: '1', Stereo: '2'
AUDIO_CHANNELS='2'

# Muestreos disponibles: '48000', '32000', '16000' y '8000',
AUDIO_SAMPLES='48000'

PUBLISH_TOKEN=xxxxxxxxxxxxxxxx
```

Ver la config de 'DEVICE' más abajo

### BITRATE y CHUNK_SIZE

**`BITRATE`** controla el bitrate de audio en bits por segundo.

- En los modos FFmpeg (MODE=1 y MODE=2), este valor se pasa directamente a FFmpeg como `-b:a`, por lo que determina la calidad y el ancho de banda real del stream.
- En el modo archivo (MODE=0), este valor **solo controla el pacing** (velocidad de envío de bytes). **No re-codifica el archivo.** El valor debe coincidir con el bitrate real del archivo MP3; de lo contrario el servidor recibirá datos más lento o más rápido que la tasa de reproducción, causando cortes o solapamiento.

> Para usar un bitrate distinto en MODE=0, re-encodear el archivo primero:
> ```bash
> ffmpeg -i ./media/audio.mp3 -b:a 64k ./media/audio-64k.mp3
> ```
> Y actualizar `MP3_FILE=./media/audio-64k.mp3` en `.env`.

**`CHUNK_SIZE`** define el tamaño en bytes de cada fragmento enviado. Junto con `BITRATE`, determina el intervalo entre envíos:

```
intervalo (ms) = (CHUNK_SIZE / (BITRATE / 8)) * 1000
```

Valores más pequeños de `CHUNK_SIZE` aumentan la frecuencia de envíos (menor latencia inicial en el servidor), pero incrementan el overhead. Valores más grandes reducen el overhead pero aumentan la latencia de buffer. El valor por defecto (4096–8192) es adecuado para la mayoría de los casos.

---

## Descargar y ejecutar para iniciar en la computadora que transmite

Requiere node

```bash
npm install
npm run dev
```

## Linux + OBS

1. Configurar las fuentes de audio en OBS.
2. Activar **Monitor and Output** en las fuentes que se quieran transmitir.
3. Configurar `LINUX_DEVICE` con el monitor de PulseAudio/PipeWire.
4. Ejecutar el Sender.

## Arquitectura

```
OBS / Archivo MP3
        │
        ▼
     FFmpeg
        │
        ▼
      Sender
        │
HTTP POST /publish
        │
        ▼
      Backend
```

---

## Configuración de mezcla, en este caso usamos OBS pero puede usarse otro mezclador (Linux)

El Sender captura el audio que OBS envía al dispositivo de monitoreo de PulseAudio/PipeWire. No utiliza **Start Streaming** ni **Start Recording** de OBS.

### 1. Agregar las fuentes de audio

En la escena de OBS, agregar las fuentes deseadas, por ejemplo:

- Audio Input Capture (micrófono)
- Audio Output Capture (audio del sistema)
- VLC Video Source
- Media Source
- Navegador (Browser Source)

### 2. Habilitar el monitoreo

En OBS:

**Edit → Advanced Audio Properties**

Para cada fuente que se quiera transmitir, en la columna **Audio Monitoring**, seleccionar:

```
Monitor and Output
```

Esto envía el audio al dispositivo de monitoreo, que será capturado por FFmpeg.

### 3. Configurar el dispositivo de monitoreo

En OBS:

**Settings → Audio → Advanced → Monitoring Device**

Seleccionar el dispositivo de salida que se utilizará para el monitoreo.

### 4. Obtener el nombre del monitor en Linux

Listar las fuentes disponibles:

```bash
pactl list short sources
```

Ejemplo:

```text
alsa_output.pci-0000_00_1f.3.analog-stereo.monitor
alsa_input.pci-0000_00_1f.3.analog-stereo
```

Usar la fuente que termina en `.monitor` en el archivo `.env`:

```env
LINUX_DEVICE=alsa_output.pci-0000_00_1f.3.analog-stereo.monitor
```

### 5. Iniciar la transmisión

Con OBS reproduciendo audio:

```bash
npm run dev
```

El Sender capturará la mezcla de OBS y la enviará automáticamente al Backend.

> **Importante:** No es necesario iniciar "Start Streaming" ni "Start Recording" en OBS. Solo debe estar abierta la aplicación reproduciendo el audio que se desea transmitir.

## Configuración de OBS (Windows)

El Sender captura el audio que OBS envía al dispositivo de monitoreo mediante FFmpeg. No utiliza **Start Streaming** ni **Start Recording** de OBS.

### 1. Agregar las fuentes de audio

En la escena de OBS, agregar las fuentes deseadas, por ejemplo:

- Audio Input Capture (micrófono)
- Audio Output Capture (audio del sistema)
- VLC Video Source
- Media Source
- Browser Source

### 2. Habilitar el monitoreo

En OBS:

**Edit → Advanced Audio Properties**

Para cada fuente que se quiera transmitir, en la columna **Audio Monitoring**, seleccionar:

```
Monitor and Output
```

### 3. Configurar el dispositivo de monitoreo

En OBS:

**Settings → Audio → Advanced → Monitoring Device**

Seleccionar el dispositivo de salida que utilizará OBS para el monitoreo (parlantes, auriculares, etc.).

### 4. Obtener el nombre del dispositivo

Listar los dispositivos de audio disponibles con FFmpeg:

```bash
ffmpeg -list_devices true -f dshow -i dummy
```

o, según la implementación del Sender:

```bash
ffmpeg -list_devices true -f wasapi -i dummy
```

La salida mostrará algo similar a:

```text
"Microphone (USB Audio Device)"
"Speakers (Realtek(R) Audio)"
```

Utilizar el nombre correspondiente en el archivo `.env`:

```env
WINDOWS_DEVICE=Speakers (Realtek(R) Audio)
```

o

```env
WINDOWS_DEVICE=Microphone (USB Audio Device)
```

(según la configuración elegida para el Sender).

### 5. Iniciar la transmisión

Con OBS, u otra herramienta para la mezcla, reproduciendo audio:

```bash
npm run dev
```
También se puede incrustar el título de la estación, un subtítulo y una descripción en el comando, de esta forma:

```bash
npm run dev 'title' 'subtitle' 'long description'
```
Se sugiere un título de hasta 14 caracteres, un subtitulo de hasta 35 char, y la descripción puede ser un poco más extensa.



#### Nota de funcionamiento:

El Sender capturará la mezcla de audio y la enviará automáticamente al Backend.

> **Importante:** No es necesario iniciar **Start Streaming** ni **Start Recording** en OBS. Basta con que OBS, u otra herramienta, esté reproduciendo el audio que se desea transmitir.
