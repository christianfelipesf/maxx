import socket
import threading
import select
import logging

logging.basicConfig(filename='proxy.log', level=logging.DEBUG)

BUFFER_SIZE = 8192

def tunnel(client, remote):
    sockets = [client, remote]
    try:
        while True:
            readable, _, _ = select.select(sockets, [], [])
            for s in readable:
                data = s.recv(BUFFER_SIZE)
                if not data:
                    return
                if s is client:
                    remote.sendall(data)
                else:
                    client.sendall(data)
    finally:
        client.close()
        remote.close()

def handle_client(client_socket):
    try:
        request = client_socket.recv(BUFFER_SIZE)
        if not request:
            return

        request_str = request.decode(errors='ignore')
        lines = request_str.split('\r\n')
        request_line = lines[0]
        parts = request_line.split(' ')

        if len(parts) < 3:
            return

        method, path, protocol = parts
        print(f"\n===== NOVA REQUISIÇÃO =====\n{request_line}")
        logging.debug(f"Requisição: {request_line}")

        if method == 'CONNECT':
            host, port = path.split(':')
            port = int(port)
            print(f"[+] Estabelecendo túnel para {host}:{port}")

            remote_socket = socket.create_connection((host, port))
            client_socket.sendall(b'HTTP/1.1 200 Connection Established\r\n\r\n')
            tunnel(client_socket, remote_socket)
            return

        # HTTP normal (GET, POST etc.)
        host = None
        for line in lines:
            if line.lower().startswith('host:'):
                host = line.split(':', 1)[1].strip()
                break
        if not host:
            return

        print(f"[+] Encaminhando para {host} na porta 80")
        remote_socket = socket.create_connection((host, 80))
        remote_socket.sendall(request)
        while True:
            response = remote_socket.recv(BUFFER_SIZE)
            if not response:
                break
            client_socket.sendall(response)
        remote_socket.close()

    except Exception as e:
        print(f"[!] Erro: {e}")
        logging.error(f"Erro: {e}")
    finally:
        client_socket.close()

def start_proxy(listen_ip='0.0.0.0', listen_port=8080):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((listen_ip, listen_port))
    server.listen(100)
    print(f"[*] Proxy escutando em {listen_ip}:{listen_port}")

    while True:
        client_sock, addr = server.accept()
        print(f"[+] Conexão recebida de {addr}")
        threading.Thread(target=handle_client, args=(client_sock,), daemon=True).start()

if __name__ == '__main__':
    start_proxy()
