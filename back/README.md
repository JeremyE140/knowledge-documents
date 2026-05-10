# Projet intensif knowledge documents

## Cloner le projet et se placer dedans

```
git clone git@gitlab.ecole.ensicaen.fr:brissot/projet-intensif-knowledge-documents.git
```
Et ensuite

```
cd ./projet-intensif-knowledge-documents
```

## Installation des dépendances

Prérequis : Node js 24.12.0
Installer les package : dans le dossier ``` projet-intensif-knowledge-documents``` :

```npm install```

## IMPORTANT : Assurez vous d'avoir un dossier nommé files à la racine du projet

Déposez-y vos documents

```Plaintext
/files
  ├── cours.pdf
  └── revisions.pdf
```

## Pour initialiser la base de données

Se placer dans le dossier /config

Depuis la racine du projet :

``` cd ./src/config ```

Et ensuite :

``` cp db.json.example db.json```

## Pour ajouter le document à la base de données :

Pas besoin de modifier manuellement le db.json, vous pouvez utiliser une requête http

* Méthode : ``` POST ```
* URL : ``` http://localhost:3000/api/documents ```
* Body (JSON) : 
```JSON
{
  "name": "Mon Cours Java",
  "path": "/files/mon-cours.pdf",
  "keywords": [
    "java",
    "backend",
    "cours"
  ],
  "type": "pdf"
}
```

## Configurez les adresses

Dupliquez le fichier d'exemple :

```
cp .env.example .env
```

Modifiez-y l'adresse du RAG si nécessaire

## Pour run le server :

```npm run dev```



