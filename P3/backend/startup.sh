sudo apt update
sudo apt install python3
sudo apt install -y python3-venv
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirement.txt
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py loaddata data.json