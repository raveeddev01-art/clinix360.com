rm -rf ca.*
rm -rf localhost.*

openssl genrsa -out ca.key 2048
openssl req -new -x509 -sha256 -days 3650 -key ca.key -subj "/C=US/ST=Colombo/L=Colombo/O=Stitch Health/CN=localhost.app" -out ca.crt

openssl req -newkey rsa:2048 -sha256 -nodes -keyout localhost.key -subj "/C=US/ST=Colombo/L=Colombo/O=Stitch Health/CN=localhost.app" -out localhost.csr
openssl x509 -sha256 -req -extfile <(printf "subjectAltName=DNS:localhost.app,DNS:*.localhost.app") -days 3650 -in localhost.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out localhost.crt
