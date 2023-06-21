# backend/app/main.py
import asyncio
import logging
from datetime import datetime
import serial
import psutil  # Import the psutil module
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FastAPI app")

app = FastAPI()

SERIAL_PORT = "/dev/ttyACM0"
BAUD_RATE = 9600

# Check if a process is using the specified port
for conn in psutil.net_connections():
    if conn.laddr.port == SERIAL_PORT:
        process = psutil.Process(conn.pid)
        process.terminate()  # Terminate the process using the port


ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
connected = False
websocket_connection = None


def data_processing(data: dict):
    # await asyncio.sleep(2)    # add 'async' to the function if you uncomment this line
    message_processed = data.get("message") + '\r\n'  # add '\r\n' for the serial port to read the command with the end-of-line character
    return message_processed


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global connected, websocket_connection
    if connected:
        await websocket.close()
        print("Connection already established")
        return
    connected = True
    websocket_connection = websocket
    await websocket.accept()
    while True:
        try:
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
                # If the message is not successfully sent, send the message and the current time to the client.
                await websocket.send_json(
                    {
                        "message": "Serial port not connected",
                        "time": datetime.now().strftime("%H:%M:%S"),
                    }
                )
        except WebSocketDisconnect:
            # If the client is disconnected, inform the client
            logger.info("The connection is closed.")
            break
    connected = False
    websocket_connection = None
