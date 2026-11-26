import { Client, Databases, Account, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const database = new Databases(client);
const account = new Account(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // 1. Use Appwrite SDK to check if this movie already exists in the database
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal('movie_id', movie.id),
  ])

  // 2. If it does, update the count
  if(result.documents.length > 0) {
   const doc = result.documents[0];

   await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
    count: doc.count + 1,
   })
  // 3. If it doesn't, create a new document with the search term and count as 1
  } else {
   await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
    searchTerm,
    count: 1,
    movie_id: movie.id,
    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
   })
  }
 } catch (error) {
  console.error(error);
 }
}

export const getTrendingMovies = async () => {
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc("count")
  ])

  return result.documents;
 } catch (error) {
  console.error(error);
 }
}

// ---------- Authentication ----------

export const signupUser = async (name, email, password) => {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

export const loginUser = async (email, password) => {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export const logoutUser = async () => {
  await account.deleteSession('current');
}

// ---------- Password recovery ----------

// Sends the reset email. The link in the email points back to this site.
export const sendRecoveryEmail = async (email) => {
  await account.createRecovery(email, window.location.origin);
}

// Called with the userId and secret that come from the link in the email
export const resetPassword = async (userId, secret, password) => {
  await account.updateRecovery(userId, secret, password);
}