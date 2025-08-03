import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export function generateKeyPair() {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

export function loadKeyPair() {
  const secretKey = localStorage.getItem('secretKey');
  const publicKey = localStorage.getItem('publicKey');
  if (secretKey && publicKey) {
    return { publicKey, secretKey };
  }
  return null;
}

export function saveKeyPair({ publicKey, secretKey }: { publicKey: string; secretKey: string }) {
  localStorage.setItem('publicKey', publicKey);
  localStorage.setItem('secretKey', secretKey);
}

export function deriveSharedKey(mySecretKeyBase64: string, theirPublicKeyBase64: string) {
  const mySecretKey = decodeBase64(mySecretKeyBase64);
  const theirPublicKey = decodeBase64(theirPublicKeyBase64);
  return nacl.scalarMult(mySecretKey, theirPublicKey);
}

export function encrypt(sharedKey: Uint8Array, plaintext: string) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = decodeUTF8(plaintext);
  const box = nacl.secretbox(messageUint8, nonce, sharedKey);
  return {
    nonce: encodeBase64(nonce),
    data: encodeBase64(box),
  };
}

export function decrypt(sharedKey: Uint8Array, nonceBase64: string, dataBase64: string) {
  const nonce = decodeBase64(nonceBase64);
  const box = decodeBase64(dataBase64);
  const messageUint8 = nacl.secretbox.open(box, nonce, sharedKey);
  if (!messageUint8) return null;
  return encodeUTF8(messageUint8);
}
