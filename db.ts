
import { firestore, firebaseReady } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc
} from "firebase/firestore";
import { User, Payment, PaymentMethod, AdminPost, AppSettings, PaymentStatus } from './types';

// Collection names
const USERS_COL = 'users';
const PAYMENTS_COL = 'payments';
const METHODS_COL = 'methods';
const POSTS_COL = 'posts';
const SETTINGS_COL = 'settings';

const handleError = (error: any, operation: string) => {
  console.error(`Database Error [${operation}]:`, error.message || error);
  if (error.code === 'permission-denied') {
    console.warn("Hint: Check your Firestore Security Rules in the Firebase Console.");
  }
};

export const db = {
  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    if (!firebaseReady) return [];
    try {
      const querySnapshot = await getDocs(collection(firestore, USERS_COL));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      return users;
    } catch (e) {
      handleError(e, 'getUsers');
      return [];
    }
  },

  addMember: async (user: Omit<User, 'id' | 'joinedDate'>) => {
    try {
      const joinedDate = new Date().toISOString();
      const docRef = await addDoc(collection(firestore, USERS_COL), {
        ...user,
        joinedDate
      });
      return { id: docRef.id, joinedDate, ...user } as User;
    } catch (e) {
      handleError(e, 'addMember');
      throw e;
    }
  },

  updateUser: async (id: string, updatedData: Partial<User>) => {
    try {
      const docRef = doc(firestore, USERS_COL, id);
      await updateDoc(docRef, updatedData);
    } catch (e) {
      handleError(e, 'updateUser');
    }
  },

  deleteUser: async (id: string) => {
    try {
      const docRef = doc(firestore, USERS_COL, id);
      await deleteDoc(docRef);
    } catch (e) {
      handleError(e, 'deleteUser');
    }
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<Payment[]> => {
    if (!firebaseReady) return [];
    try {
      const querySnapshot = await getDocs(collection(firestore, PAYMENTS_COL));
      const payments: Payment[] = [];
      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() } as Payment);
      });
      return payments;
    } catch (e) {
      handleError(e, 'getPayments');
      return [];
    }
  },

  addPayment: async (payment: Omit<Payment, 'id'>) => {
    try {
      const docRef = await addDoc(collection(firestore, PAYMENTS_COL), payment);
      return { id: docRef.id, ...payment } as Payment;
    } catch (e) {
      handleError(e, 'addPayment');
      throw e;
    }
  },

  approvePayment: async (id: string, adminId: string) => {
    try {
      const docRef = doc(firestore, PAYMENTS_COL, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Payment;
        const status = data.fineAmount > 0 ? PaymentStatus.LATE : PaymentStatus.PAID;
        await updateDoc(docRef, { status, adminId });
        return { ...data, status, adminId, id };
      }
    } catch (e) {
      handleError(e, 'approvePayment');
    }
    return null;
  },

  rejectPayment: async (id: string) => {
    try {
      await deleteDoc(doc(firestore, PAYMENTS_COL, id));
    } catch (e) {
      handleError(e, 'rejectPayment');
    }
  },

  // --- METHODS ---
  getMethods: async (): Promise<PaymentMethod[]> => {
    if (!firebaseReady) return [];
    try {
      const querySnapshot = await getDocs(collection(firestore, METHODS_COL));
      const methods: PaymentMethod[] = [];
      querySnapshot.forEach((doc) => {
        methods.push({ id: doc.id, ...doc.data() } as PaymentMethod);
      });
      return methods;
    } catch (e) {
      handleError(e, 'getMethods');
      return [];
    }
  },

  addMethod: async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      await addDoc(collection(firestore, METHODS_COL), method);
    } catch (e) {
      handleError(e, 'addMethod');
    }
  },

  updateMethod: async (id: string, updatedData: Partial<PaymentMethod>) => {
    try {
      await updateDoc(doc(firestore, METHODS_COL, id), updatedData);
    } catch (e) {
      handleError(e, 'updateMethod');
    }
  },

  deleteMethod: async (id: string) => {
    try {
      await deleteDoc(doc(firestore, METHODS_COL, id));
    } catch (e) {
      handleError(e, 'deleteMethod');
    }
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<AppSettings> => {
    const defaultSettings: AppSettings = {
      appName: 'সঞ্চয় প্রো',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/3258/3258446.png',
      enableNotifications: false,
      telegramBotToken: '',
      telegramChatId: ''
    };
    
    if (!firebaseReady) return defaultSettings;

    try {
      const docRef = doc(firestore, SETTINGS_COL, 'app_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
    } catch (e) {
      handleError(e, 'getSettings');
    }
    return defaultSettings;
  },

  saveSettings: async (settings: AppSettings) => {
    try {
      await setDoc(doc(firestore, SETTINGS_COL, 'app_config'), settings);
    } catch (e) {
      handleError(e, 'saveSettings');
    }
  },

  // --- POSTS ---
  getPosts: async (): Promise<AdminPost[]> => {
    if (!firebaseReady) return [];
    try {
      const q = query(collection(firestore, POSTS_COL), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts: AdminPost[] = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as AdminPost);
      });
      return posts;
    } catch (e) {
      handleError(e, 'getPosts');
      return [];
    }
  },

  addPost: async (post: Omit<AdminPost, 'id' | 'createdAt'>) => {
    try {
      const createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(firestore, POSTS_COL), { ...post, createdAt });
      return { id: docRef.id, createdAt, ...post } as AdminPost;
    } catch (e) {
      handleError(e, 'addPost');
      throw e;
    }
  },

  deletePost: async (id: string) => {
    try {
      await deleteDoc(doc(firestore, POSTS_COL, id));
    } catch (e) {
      handleError(e, 'deletePost');
    }
  }
};
