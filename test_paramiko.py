
try:
    print("Importing paramiko...")
    import paramiko
    print("Paramiko imported successfully.")
except ImportError as e:
    print(f"Failed to import paramiko: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
