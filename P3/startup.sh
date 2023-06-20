sudo apt update
sudo apt install python3
sudo apt install -y python3-venv
python3 -m venv venv
source venv/bin/activate
cd backend
pip3 install -r requirement.txt
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py loaddata data.json
cd ..
sudo apt-get install -y curl gnupg2 ca-certificates lsb-release
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g npm@9.5.0
cd frontend
npm --force install
cd ..