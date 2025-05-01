import socket
import threading
import logging

# Configuração do logging
logging.basicConfig(filename='proxy.log', level=logging.DEBUG)

# Função para lidar com o cliente
def handle_client(client_socket):
    try:
        # Recebe a requisição do cliente
        request = client_socket.recv(4096)
        
        if not request:
            print("Erro: Nenhum dado recebido do cliente.")
            return
        
        print("\n===== NOVA REQUISIÇÃO =====")
        request_decoded = request.decode(errors='ignore')
        
        # Exibir a requisição de forma detalhada
        print(f"Requisição recebida:\n{request_decoded}")
        logging.debug(f"Requisição recebida:\n{request_decoded}")
        
        # Dividir os cabeçalhos da requisição
        headers = request_decoded.split('\r\n')
        request_line = headers[0].split(' ')
        method, path, protocol = request_line
        print(f"Tipo de requisição: {method}")
        print(f"Caminho solicitado: {path}")
        print(f"Protocolo: {protocol}")
        
        # Exibir corpo de requisição (se for POST, PUT, PATCH, etc.)
        if method in ['POST', 'PUT', 'PATCH']:
            content_length = next((line.split(':')[1].strip() for line in headers if line.lower().startswith('content-length:')), None)
            if content_length:
                content_length = int(content_length)
                body = request[-content_length:].decode(errors='ignore')
                print(f"Corpo da requisição: {body}")
                logging.debug(f"Corpo da requisição:\n{body}")
        
        # Identificar o host no cabeçalho e conectar ao servidor de destino
        host = '127.0.0.1'  # Fallback
        for line in headers:
            if line.lower().startswith('host:'):
                host = line.split(':')[1].strip()
                break
        
        # Conectar ao servidor remoto
        remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        remote_socket.connect((host, 80))

        # Enviar a requisição para o servidor remoto
        remote_socket.send(request)

        # Receber a resposta do servidor remoto
        while True:
            response = remote_socket.recv(4096)
            if len(response) == 0:
                break
            
            # Exibir a resposta recebida
            print("\n===== RESPOSTA DO SERVIDOR =====")
            response_decoded = response.decode(errors='ignore')
            headers, body = response_decoded.split('\r\n\r\n', 1)  # Separar cabeçalhos e corpo
            
            print(f"Cabeçalhos da resposta:\n{headers}")
            print(f"Corpo da resposta:\n{body}")
            logging.debug(f"Resposta recebida:\n{response_decoded}")
            
            # Enviar a resposta de volta para o cliente
            client_socket.send(response)
        
        remote_socket.close()
    
    except socket.timeout:
        print("Erro: Tempo limite de conexão excedido.")
        logging.error("Erro: Tempo limite de conexão excedido.")
    
    except socket.error as e:
        print(f"Erro de rede: {e}")
        logging.error(f"Erro de rede: {e}")
    
    except Exception as e:
        print(f"Erro inesperado: {e}")
        logging.error(f"Erro inesperado: {e}")
    
    finally:
        client_socket.close()

# Função principal para iniciar o proxy
def start_proxy(listen_ip='0.0.0.0', listen_port=8080):
    proxy_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    proxy_socket.bind((listen_ip, listen_port))
    proxy_socket.listen(5)
    
    print(f"[*] Proxy escutando em {listen_ip}:{listen_port}")
    logging.info(f"Proxy escutando em {listen_ip}:{listen_port}")

    while True:
        client_socket, addr = proxy_socket.accept()
        print(f"[*] Conexão recebida de {addr}")
        logging.info(f"Conexão recebida de {addr}")
        
        # Criar uma thread para cada cliente
        client_thread = threading.Thread(target=handle_client, args=(client_socket,))
        client_thread.start()

if __name__ == '__main__':
    start_proxy()
