import os
import hashlib
import tkinter as tk
from tkinter import messagebox

def generate_numeric_hash(filename, length=6):
    hash_object = hashlib.md5(filename.encode())
    numeric_hash = str(int(hash_object.hexdigest(), 16))[:length]
    return numeric_hash

def rename_files_in_directory():
    current_dir = os.getcwd()
    renamed_files = {}
    
    for filename in os.listdir(current_dir):
        if os.path.isfile(filename) and not filename.endswith("_hashlog.txt"):
            hash_suffix = generate_numeric_hash(filename)
            name, ext = os.path.splitext(filename)
            new_filename = f"{name}_{hash_suffix}{ext}"
            os.rename(filename, new_filename)
            renamed_files[new_filename] = filename
    
    with open("_hashlog.txt", "w") as log:
        for new, old in renamed_files.items():
            log.write(f"{new},{old}\n")
    
    messagebox.showinfo("Sucesso", "Arquivos renomeados com hash!")

def restore_original_filenames():
    if not os.path.exists("_hashlog.txt"):
        messagebox.showwarning("Aviso", "Nenhum log de renomeação encontrado!")
        return
    
    with open("_hashlog.txt", "r") as log:
        lines = log.readlines()
    
    for line in lines:
        new_filename, original_filename = line.strip().split(",")
        if os.path.exists(new_filename):
            os.rename(new_filename, original_filename)
    
    os.remove("_hashlog.txt")
    messagebox.showinfo("Sucesso", "Arquivos restaurados para os nomes originais!")

root = tk.Tk()
root.title("Gerenciador de Hash de Arquivos")

generate_button = tk.Button(root, text="Gerar Hash", command=rename_files_in_directory)
generate_button.pack(pady=10)

restore_button = tk.Button(root, text="Retirar Hash", command=restore_original_filenames)
restore_button.pack(pady=10)

root.mainloop()
