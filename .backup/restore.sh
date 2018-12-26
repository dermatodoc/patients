#!/usr/bin/env sh

set -o xtrace

SERVER='meteorapp@localhost'
IDENTITY="$HOME/.ssh/meteorapp"
CRYPTO="-pbkdf2"

cd "$(dirname "$0")"
ssh -i "$IDENTITY" "$SERVER" rm -rf dump/patients patients.gz patients.gz.enc || exit 1
rsync -a patients-backup.gz.enc "$SERVER":patients.gz.enc || exit 1
ssh "$SERVER" openssl enc -d $CRYPTO -in patients.gz.enc -out patients.gz -pass file:key/patients || exit 1
ssh "$SERVER" tar xzf patients.gz || exit 1
ssh "$SERVER" mongorestore -d patients dump/patients/

if [ "$?" -eq 0 ] ; then
  echo 'SUCCESS!!'
else
  echo 'FAILURE...'
fi
