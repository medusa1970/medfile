/**
 * Elimina una cuenta de prueba y su tenant asociado.
 *
 * Uso:
 *   MONGODB_URI="mongodb+srv://..." node scripts/delete-account-by-email.mjs jaimewvf@gmail.com
 */
import { MongoClient, ObjectId } from 'mongodb';

const email = process.argv[2]?.trim().toLowerCase();
const uri = process.env.MONGODB_URI;

if (!email || !uri) {
  console.error('Uso: MONGODB_URI=... node scripts/delete-account-by-email.mjs email@ejemplo.com');
  process.exit(1);
}

const tenantCollections = [
  'subscriptions',
  'patients',
  'encounters',
  'uploadrequests',
  'medicaldocuments',
  'paymentevents',
  'qrpayments',
  'clinicsites',
  'dayqueueentries',
  'nursingcaptures',
  'teaminvitations',
  'auditlogs',
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    console.log(`No hay usuario con email ${email}`);
    process.exit(0);
  }

  const tenantId = String(user.tenantId);
  console.log(`Usuario: ${user._id} (${email})`);
  console.log(`Tenant: ${tenantId}`);

  for (const name of tenantCollections) {
    const result = await db.collection(name).deleteMany({ tenantId });
    if (result.deletedCount > 0) {
      console.log(`  ${name}: ${result.deletedCount} documento(s) eliminado(s)`);
    }
  }

  const shares = await db.collection('clinicalshares').deleteMany({
    $or: [{ sourceTenantId: tenantId }, { targetTenantId: tenantId }],
  });
  if (shares.deletedCount > 0) {
    console.log(`  clinicalshares: ${shares.deletedCount} documento(s) eliminado(s)`);
  }

  await db.collection('users').deleteMany({ tenantId });
  await db.collection('tenants').deleteOne({ _id: new ObjectId(tenantId) });

  console.log('Cuenta eliminada. Ya puedes registrarte de nuevo con ese correo.');
} catch (error) {
  console.error('Error al eliminar la cuenta:', error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.close();
}
