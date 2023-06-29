# backend/app/main.py
import asyncio
import logging
from datetime import datetime
import serial
import psutil  # Import the psutil module
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FastAPI app")

app = FastAPI()

SERIAL_PORT = "/dev/ttyACM0"
BAUD_RATE = 9600

def kill_process_by_device(device_name):
    try:
        for proc in psutil.process_iter():
            try:
                if device_name in proc.open_files()[0].path:
                    proc.terminate()
                    proc.wait(timeout=5)  # Attendre jusqu'à 5 secondes pour que le processus se termine
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                pass
    except Exception as e:
        print(f"Erreur lors de la tentative de terminaison du processus : {e}")

def get_process_using_port(port):
    try:
        output = subprocess.check_output(["lsof", "-t", f"-c {port}"])
        pid = int(output.decode().strip())
        return pid
    except (subprocess.CalledProcessError, ValueError):
        return None

pid = get_process_using_port(SERIAL_PORT)

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    print(f"Serial port {SERIAL_PORT} connected on PID : {pid}")
except serial.SerialException:
    logger.info("Serial port not connected")
    ser = serial.Serial()


connected = False
websocket_connection = None


def data_processing(data: dict):
    # await asyncio.sleep(2)    # add 'async' to the function if you uncomment this line
    message_processed = data.get("message") + '\r\n'  # add '\r\n' for the serial port to read the command with the end-of-line character
    return message_processed


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global connected, websocket_connection, ser
    if connected:
        await websocket.close()
        print("Connection already established")
        return
    else:
        print("Connection established")
    if not ser.isOpen():
        ser.open()
    connected = True
    websocket_connection = websocket
    await websocket.accept()
    try:
        while True:
            # Receive the JSON data sent by a client.
            data = await websocket.receive_text()
            print("Received message: " + data)  # Log the received message.
            message_processed = data_processing(json.loads(data))
            logger.info("Received message: %s", message_processed)  # Log the received message.
            # Send JSON data to the client.
            if ser.isOpen():
                if 'config sent' not in message_processed:  # Check if the configuration is done
                    ser.write(bytes(message_processed, 'utf-8'))  # sending the message to the card
                    ser.flush()
                    reading = ser.readline()
                    while 'ok' not in reading.decode('utf-8'):  # waiting for the card to send the ok message
                        reading = ser.readline()
                        if 'rs' in reading.decode('utf-8'):  # if the card sends an error message, send it to the client
                            ser.write(bytes(message_processed, 'utf-8'))
                            ser.flush()
                        if 'err' in reading.decode('utf-8'):  # if the card sends an error message, send it to the client
                            break
                    await websocket.send_json(
                        # If the message is successfully sent, send the message and the current time to the client.
                        {
                            "message": message_processed,
                            "time": datetime.now().strftime("%H:%M:%S"),
                            "read": reading.decode('utf-8'),
                            "done": True
                        }
                    )
                else:
                    await websocket.send_json(
                        # If the message is successfully sent, send the message and the current time to the client.
                        {
                            "message": message_processed,
                            "time": datetime.now().strftime("%H:%M:%S"),
                            "read": "",
                            "done": True
                        }
                    )
            else:
                raise serial.SerialException("Serial port not connected")
    except WebSocketDisconnect:
        # If the client is disconnected, inform the client
        logger.info("The connection is closed.")
    except serial.SerialException as e:
        # If the message is not successfully sent, send the message and the current time to the client.
        await websocket.send_json(
            {
                "message": "Serial port not connected",
                "time": datetime.now().strftime("%H:%M:%S"),
            }
        )
        await websocket.close()
        ser.close()
        pid = get_process_using_port(SERIAL_PORT)
        print(f"Le port {SERIAL_PORT} est utilisé par le processus avec PID {pid}, il va etre fermé.")
        try:
            kill_process_by_device("/dev/ttyACM0")
            print(f"Le processus avec PID {pid} a été fermé.")
        except subprocess.CalledProcessError as f:
            print(f"Le processus avec PID {pid} n'a pas pu être fermé.")
        logger.info(f"Error: {e=}")
    connected = False
    websocket_connection = None
