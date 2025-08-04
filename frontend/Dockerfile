FROM nginx:alpine

# Copie des fichiers statiques
COPY . /usr/share/nginx/html

# Configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port d'exposition
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
