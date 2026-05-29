/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  createClient, 
  SupabaseClient 
} from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Gift, 
  QrCode, 
  Search, 
  Unlock, 
  Plus, 
  Check, 
  Trash2, 
  PlusCircle, 
  LogOut, 
  TrendingUp, 
  Filter, 
  Database, 
  FileSpreadsheet, 
  Smile, 
  UserPlus, 
  Calendar, 
  Home, 
  Key, 
  UserCheck, 
  Activity,
  ChevronRight
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface Admin {
  id: string;
  username: string;
  password?: string;
}

export interface Wedding {
  id: string;
  title: string;
  host_username: string;
  host_password?: string;
  khqr_img_url: string;
  created_at?: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  phone: string;
  companions: number;
  relation_type: string; // 'ខាងកូនកំលោះ', 'ខាងកូនក្រមុំ', 'មិត្តភក្តិ', 'ផ្សេងៗ'
  amount: number;
  note: string;
  status: 'pending' | 'approved';
  created_at?: string;
}

// ==========================================
// DEFAULT LOCAL MOCK SEEDS (Offline Fallback)
// ==========================================
const MOCK_ADMINS: Admin[] = [
  { id: 'admin-uuid-1', username: 'admin123', password: 'password123' }
];

const MOCK_WEDDINGS: Wedding[] = [
  {
    id: 'w-uuid-1',
    title: 'អាពាហ៍ពិពាហ៍កូនប្រុស សុខា & កូនស្រី នារី',
    host_username: 'sokha',
    host_password: 'sokha123',
    khqr_img_url: 'https://i.ibb.co/ZJv2v3X/qr-mock-placeholder.png' // High quality placeholder or real Link
  },
  {
    id: 'w-uuid-2',
    title: 'មង្គលការកូនប្រុស វឌ្ឍនៈ & កូនស្រី ទេវី',
    host_username: 'vattanak',
    host_password: 'vattanak123',
    khqr_img_url: 'https://i.ibb.co/f472b6/another-qr-mock.png'
  }
];

const MOCK_GUESTS: Guest[] = [
  {
    id: 'g-uuid-1',
    wedding_id: 'w-uuid-1',
    name: 'សេង ហុង',
    phone: '099888777',
    companions: 1,
    relation_type: 'ខាងកូនកំលោះ',
    amount: 50,
    note: 'សូមជូនពរឱ្យស្រលាញ់គ្នាដល់ចាស់កោងខ្នង!',
    status: 'approved',
    created_at: '2026-05-28T08:00:00Z'
  },
  {
    id: 'g-uuid-2',
    wedding_id: 'w-uuid-1',
    name: 'នួន ស្រីរ័ត្ន',
    phone: '012334455',
    companions: 0,
    relation_type: 'ខាងកូនក្រមុំ',
    amount: 100,
    note: 'ហេងៗ រកស៊ីមានបាន ឆាប់បានកូនពង្ស!',
    status: 'approved',
    created_at: '2026-05-28T09:30:00Z'
  },
  {
    id: 'g-uuid-3',
    wedding_id: 'w-uuid-1',
    name: 'ឈាន សំណាង',
    phone: '085556677',
    companions: 2,
    relation_type: 'មិត្តភក្តិ',
    amount: 40,
    note: 'រីករាយថ្ងៃមង្គលការសម្លាញ់!',
    status: 'pending',
    created_at: '2026-05-29T02:15:00Z'
  },
  {
    id: 'g-uuid-4',
    wedding_id: 'w-uuid-2',
    name: 'គឹម ស្រ៊ុន',
    phone: '0977112233',
    companions: 1,
    relation_type: 'ខាងកូនកំលោះ',
    amount: 30,
    note: 'ជូនពរមានសុភមង្គល!',
    status: 'approved',
    created_at: '2026-05-28T10:00:00Z'
  }
];

export default function App() {
  // ==========================================
  // VIEW AND ROUTING STATES
  // ==========================================
  const [currentView, setCurrentView] = useState<'guest' | 'admin' | 'host'>('guest');
  
  // ==========================================
  // DATABASE CONFIG STATES (User can configure Live Supabase)
  // ==========================================
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(() => {
    return localStorage.getItem('wedding_supabase_url') || '';
  });
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState<string>(() => {
    return localStorage.getItem('wedding_supabase_anon_key') || '';
  });
  const [useLiveSupabase, setUseLiveSupabase] = useState<boolean>(() => {
    return localStorage.getItem('wedding_use_live_supabase') === 'true';
  });
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  // Initialize client if configured
  const supabaseClient = useMemo<SupabaseClient | null>(() => {
    if (useLiveSupabase && supabaseUrlInput && supabaseAnonKeyInput) {
      try {
        return createClient(supabaseUrlInput, supabaseAnonKeyInput);
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        return null;
      }
    }
    return null;
  }, [useLiveSupabase, supabaseUrlInput, supabaseAnonKeyInput]);

  // ==========================================
  // MEMORY STORE (For Local Simulator mode if not live)
  // ==========================================
  const [localAdmins, setLocalAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('wedding_local_admins');
    return saved ? JSON.parse(saved) : MOCK_ADMINS;
  });
  const [localWeddings, setLocalWeddings] = useState<Wedding[]>(() => {
    const saved = localStorage.getItem('wedding_local_weddings');
    return saved ? JSON.parse(saved) : MOCK_WEDDINGS;
  });
  const [localGuests, setLocalGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('wedding_local_guests');
    return saved ? JSON.parse(saved) : MOCK_GUESTS;
  });

  // Persists local mock databases
  useEffect(() => {
    localStorage.setItem('wedding_local_admins', JSON.stringify(localAdmins));
  }, [localAdmins]);

  useEffect(() => {
    localStorage.setItem('wedding_local_weddings', JSON.stringify(localWeddings));
  }, [localWeddings]);

  useEffect(() => {
    localStorage.setItem('wedding_local_guests', JSON.stringify(localGuests));
  }, [localGuests]);

  // Save Config parameters
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('wedding_supabase_url', supabaseUrlInput);
    localStorage.setItem('wedding_supabase_anon_key', supabaseAnonKeyInput);
    localStorage.setItem('wedding_use_live_supabase', String(useLiveSupabase));
    
    setShowConfigDrawer(false);
    alert("រចនាសម្ព័ន្ធ Supabase ត្រូវបានរក្សាទុក! កម្មវិធីនឹងដំណើរការការស្កេនទិន្នន័យឡើងវិញ។");
    
    // Reload components
    fetchInitialData();
  };

  // ==========================================
  // GLOBAL STATE DATA
  // ==========================================
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [activeWedding, setActiveWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch initial data based on active mode
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (supabaseClient) {
        // Fetch weddings
        const { data: weddingsData, error: wError } = await supabaseClient
          .from('weddings')
          .select('*')
          .order('title', { ascending: true });
        
        if (wError) throw wError;

        if (weddingsData) {
          setWeddings(weddingsData);
          // Auto select first wedding if none active
          if (weddingsData.length > 0) {
            setActiveWedding(prev => {
              const stillExists = weddingsData.find(w => w.id === prev?.id);
              return stillExists || weddingsData[0];
            });
          } else {
            setActiveWedding(null);
          }
        }
      } else {
        // Local Mode
        setWeddings(localWeddings);
        if (localWeddings.length > 0) {
          setActiveWedding(prev => {
            const stillExists = localWeddings.find(w => w.id === prev?.id);
            return stillExists || localWeddings[0];
          });
        } else {
          setActiveWedding(null);
        }
      }
    } catch (err) {
      console.error("Error fetching weddings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch guests whenever activeWedding or DB state change
  const fetchGuests = async () => {
    if (!activeWedding) {
      setGuests([]);
      return;
    }
    setLoading(true);
    try {
      if (supabaseClient) {
        const { data: guestsData, error: gError } = await supabaseClient
          .from('guests')
          .select('*')
          .eq('wedding_id', activeWedding.id)
          .order('created_at', { ascending: false });
        
        if (gError) throw gError;
        setGuests(guestsData || []);
      } else {
        // Local Mode
        const filtered = localGuests.filter(g => g.wedding_id === activeWedding.id);
        const sorted = [...filtered].sort((a, b) => {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
        setGuests(sorted);
      }
    } catch (err) {
      console.error("Error fetching guests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [useLiveSupabase, supabaseClient, localWeddings]);

  useEffect(() => {
    fetchGuests();
  }, [activeWedding, localGuests]);

  // ==========================================
  // GUEST RSVP FLOW
  // ==========================================
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCompanions, setGuestCompanions] = useState<number>(0);
  const [guestRelation, setGuestRelation] = useState('ខាងកូនកំលោះ');
  const [guestAmount, setGuestAmount] = useState<string>('');
  const [guestNote, setGuestNote] = useState('');
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [lastSubmittedGuest, setLastSubmittedGuest] = useState<Guest | null>(null);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWedding) {
      alert("សូមជ្រើសរើសពិធីការណ៏ជាមុនសិន!");
      return;
    }
    if (!guestName.trim()) {
      alert("សូមបញ្ចូលឈ្មោះរបស់អ្នក!");
      return;
    }
    
    const newGuest: Guest = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'g-' + Math.random().toString(36).substr(2, 9),
      wedding_id: activeWedding.id,
      name: guestName.trim(),
      phone: guestPhone.trim() || 'គ្មានលេខ',
      companions: Number(guestCompanions),
      relation_type: guestRelation,
      amount: Number(guestAmount) || 0,
      note: guestNote.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setLoading(true);
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('guests')
          .insert([newGuest]);
        if (error) throw error;
      };

      // Also append to local state to represent or fallback
      setLocalGuests(prev => [newGuest, ...prev]);
      setLastSubmittedGuest(newGuest);
      setRegistrationSubmitted(true);
      
      // Clear inputs
      setGuestName('');
      setGuestPhone('');
      setGuestCompanions(0);
      setGuestRelation('ខាងកូនកំលោះ');
      setGuestAmount('');
      setGuestNote('');
    } catch (err: any) {
      alert("ការចុះឈ្មោះមានបញ្ហា៖ " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADMIN DASHBOARD FLOW
  // ==========================================
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // New wedding event inputs
  const [newWeddingTitle, setNewWeddingTitle] = useState('');
  const [newWeddingHostUser, setNewWeddingHostUser] = useState('');
  const [newWeddingHostPass, setNewWeddingHostPass] = useState('');
  const [newWeddingKHQR, setNewWeddingKHQR] = useState('');
  const [showAddWeddingModal, setShowAddWeddingModal] = useState(false);

  // Manual guest creation by Admin
  const [manGuestName, setManGuestName] = useState('');
  const [manGuestPhone, setManGuestPhone] = useState('');
  const [manGuestCompanions, setManGuestCompanions] = useState<number>(0);
  const [manGuestRelation, setManGuestRelation] = useState('ខាងកូនកំលោះ');
  const [manGuestAmount, setManGuestAmount] = useState<string>('');
  const [manGuestNote, setManGuestNote] = useState('');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  // Handle Admin Auth
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('admins')
          .select('*')
          .eq('username', adminUsername)
          .eq('password', adminPassword)
          .single();
        
        if (error || !data) {
          alert("ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ!");
        } else {
          setIsAdminLoggedIn(true);
        }
      } else {
        // Local Mode Check
        const match = localAdmins.find(
          a => a.username === adminUsername && a.password === adminPassword
        );
        if (match) {
          setIsAdminLoggedIn(true);
        } else {
          alert("ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ! (គណនីទូទៅ៖ admin123 / លេខសម្ងាត់៖ password123)");
        }
      }
    } catch (err) {
      alert("មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់គណនីរៀបចំការ។");
    } finally {
      setLoading(false);
    }
  };

  // Create new Wedding Event
  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeddingTitle.trim() || !newWeddingHostUser.trim() || !newWeddingHostPass.trim()) {
      alert("សូមបំពេញព័ត៌មានសំខាន់ៗឱ្យបានគ្រប់ជ្រុងជ្រោយ!");
      return;
    }

    const defaultQR = newWeddingKHQR.trim() || 'https://raw.githubusercontent.com/sitecore/sitecore-assets/master/images/placeholder.png';

    const newW: Wedding = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'w-' + Math.random().toString(36).substr(2, 9),
      title: newWeddingTitle.trim(),
      host_username: newWeddingHostUser.trim(),
      host_password: newWeddingHostPass.trim(),
      khqr_img_url: defaultQR,
      created_at: new Date().toISOString()
    };

    setLoading(true);
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('weddings')
          .insert([newW]);
        if (error) throw error;
      }

      setLocalWeddings(prev => [newW, ...prev]);
      setActiveWedding(newW);
      setShowAddWeddingModal(false);
      
      // Clear inputs
      setNewWeddingTitle('');
      setNewWeddingHostUser('');
      setNewWeddingHostPass('');
      setNewWeddingKHQR('');
      alert("ពិធីការណ៏អាពាហ៍ពិពាហ៍ថ្មីត្រូវបានបង្កើតឡើងដោយជោគជ័យ! 🎉");
    } catch (err: any) {
      alert("បរាជ័យក្នុងការបង្កើតកម្មវិធីថ្មី៖ " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Manual guest registration by Admin
  const handleAdminAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWedding) {
      alert("សូមជ្រើសរើសពិធីការណ៏អាពាហ៍ពិពាហ៍!");
      return;
    }
    if (!manGuestName.trim()) {
      alert("សូមបញ្ចូលឈ្មោះភ្ញៀវ!");
      return;
    }

    const newG: Guest = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'g-' + Math.random().toString(36).substr(2, 9),
      wedding_id: activeWedding.id,
      name: manGuestName.trim(),
      phone: manGuestPhone.trim() || 'គ្មានលេខ',
      companions: Number(manGuestCompanions),
      relation_type: manGuestRelation,
      amount: Number(manGuestAmount) || 0,
      note: manGuestNote.trim(),
      status: 'approved', // Admin manual entry defaults to approved
      created_at: new Date().toISOString()
    };

    setLoading(true);
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('guests')
          .insert([newG]);
        if (error) throw error;
      }

      setLocalGuests(prev => [newG, ...prev]);
      setShowAddGuestModal(false);
      
      // Clear keys
      setManGuestName('');
      setManGuestPhone('');
      setManGuestCompanions(0);
      setManGuestRelation('ខាងកូនកំលោះ');
      setManGuestAmount('');
      setManGuestNote('');
      
      alert("បានបន្ថែមភ្ញៀវដោយជោគជ័យ!");
    } catch (err: any) {
      alert("មានបញ្ហាក្នុងការបន្ថែមភ្ញៀវ៖ " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Approve Guest Status
  const handleApproveGuest = async (id: string) => {
    setLoading(true);
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('guests')
          .update({ status: 'approved' })
          .eq('id', id);
        if (error) throw error;
      }

      setLocalGuests(prev => 
        prev.map(g => g.id === id ? { ...g, status: 'approved' } : g)
      );
    } catch (err: any) {
      alert("មិនអាចផ្លាស់ប្តូរស្ថានភាព៖ " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបព័ត៌មានភ្ញៀវរូបនេះមែនទេ? ប្រតិបត្តិការនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។")) {
      return;
    }
    
    setLoading(true);
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('guests')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }

      setLocalGuests(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      alert("មិនអាចលុបទិន្នន័យ៖ " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search compiled admin guest view
  const filteredGuestsForAdmin = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (adminFilter === 'all') return matchSearch;
      return matchSearch && g.status === adminFilter;
    });
  }, [guests, searchQuery, adminFilter]);

  // ==========================================
  // HOST (COUPLE DETAILED VIEWS) FLOW
  // ==========================================
  const [isHostLoggedIn, setIsHostLoggedIn] = useState(false);
  const [hostUsername, setHostUsername] = useState('');
  const [hostPassword, setHostPassword] = useState('');
  const [hostSearchQuery, setHostSearchQuery] = useState('');

  // Handle Host Auth check
  const handleHostLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Find matching wedding in client weddings
    const foundWedding = weddings.find(
      w => w.host_username === hostUsername.trim() && w.host_password === hostPassword.trim()
    );

    if (foundWedding) {
      setActiveWedding(foundWedding);
      setIsHostLoggedIn(true);
    } else {
      alert("លេខគណនី ឬលេខសម្ងាត់របស់ ម្ចាស់ដើមការ មិនត្រឹមត្រូវទេ! (សាកល្បង៖ sokha / sokha123)");
    }
    setLoading(false);
  };

  // Host stats
  const hostStats = useMemo(() => {
    // Total registered (approved + pending)
    const totalReg = guests.length;
    
    // Total attendees (Only approved main guests + their companions)
    const approvedGuests = guests.filter(g => g.status === 'approved');
    const totalActualAttendees = approvedGuests.reduce((acc, curr) => acc + 1 + curr.companions, 0);

    // Total Gift Money
    const totalGiftAmount = approvedGuests.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Sides counts
    const groomSide = approvedGuests.filter(g => g.relation_type === 'ខាងកូនកំលោះ').length;
    const brideSide = approvedGuests.filter(g => g.relation_type === 'ខាងកូនក្រមុំ').length;
    const friends = approvedGuests.filter(g => g.relation_type === 'មិត្តភក្តិ').length;
    const others = approvedGuests.filter(g => g.relation_type === 'ផ្សេងៗ').length;

    return {
      totalReg,
      totalActualAttendees,
      totalGiftAmount,
      groomSide,
      brideSide,
      friends,
      others
    };
  }, [guests]);

  // Search filtered guests for Host
  const filteredGuestsForHost = useMemo(() => {
    return guests.filter(g => {
      return g.name.toLowerCase().includes(hostSearchQuery.toLowerCase()) || 
             g.phone.toLowerCase().includes(hostSearchQuery.toLowerCase());
    });
  }, [guests, hostSearchQuery]);

  // Export to Excel using SheetJS
  const handleExportToExcel = () => {
    if (!activeWedding || guests.length === 0) {
      alert("គ្មានទិន្នន័យដើម្បីនាំចេញទេ!");
      return;
    }

    // Format fields with Khmer heading translation
    const excelRows = guests.map((g, idx) => ({
      'ល.រ (No.)': idx + 1,
      'ឈ្មោះភ្ញៀវ (Guest Name)': g.name,
      'លេខទូរស័ព្ទ (Phone Number)': g.phone,
      'ចំនួនអ្នករួមដំណើរ (Companions)': g.companions,
      'ប្រភេទទំនាក់ទំនង (Relation Side)': g.relation_type,
      'ចំនួនថវិកាចងដៃ ($) (Gift Amount)': g.amount,
      'កំណត់សម្គាល់ (Note)': g.note,
      'ស្ថានភាព (Status)': g.status === 'approved' ? 'បានអនុម័ត' : 'រង់ចាំពិនិត្យ',
      'កាលបរិច្ឆេទចុះឈ្មោះ (RSVP Date)': g.created_at ? new Date(g.created_at).toLocaleString('km-KH') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ភ្ញៀវចូលរួម");

    // Calculate columns width
    const max_width = excelRows.reduce((w, r) => Object.keys(r).reduce((mw, k) => Math.max(mw, String(r[k as keyof typeof r]).length), w), 10);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 20 } ];

    const fileName = `បញ្ជីភ្ញៀវ_${activeWedding.title.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper calculation for Guest view real-time calculations
  const parsedAmountNumber = Number(guestAmount) || 0;

  return (
    <div className="min-h-screen bg-[#FDF2F8] text-slate-800 flex flex-col antialiased selection:bg-pink-500 selection:text-white">
      
      {/* =================================================== */}
      {/* 🛠️ DEMO CONTROLLER TOOLBAR (For client verification) */}
      {/* =================================================== */}
      <div className="bg-slate-900 text-white py-2.5 px-4 shadow-md sticky top-0 z-50 overflow-x-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="bg-pink-500 text-white font-bold px-2 py-0.5 rounded text-xs tracking-wider animate-pulse">
            DEMO PREVIEW PANEL
          </span>
          <span className="font-medium text-slate-300">លោកអ្នកអាចសាកល្បងតួនាទីទាំង៣ បានភ្លាមៗ៖</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="demo-guest-btn"
            onClick={() => setCurrentView('guest')} 
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-250 flex items-center gap-1.5 ${currentView === 'guest' ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
          >
            <UserPlus size={16} />
            ១. ភ្ញៀវចុះឈ្មោះ (Guest)
          </button>
          
          <button 
            id="demo-admin-btn"
            onClick={() => setCurrentView('admin')} 
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-250 flex items-center gap-1.5 ${currentView === 'admin' ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
          >
            <Unlock size={16} />
            ២. អ្នករៀបចំការ (Admin)
          </button>
          
          <button 
            id="demo-host-btn"
            onClick={() => setCurrentView('host')} 
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-250 flex items-center gap-1.5 ${currentView === 'host' ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
          >
            <Heart size={16} />
            ៣. ម្ចាស់អាពាហ៍ពិពាហ៍ (Host)
          </button>

          <span className="h-4 w-[1px] bg-slate-700 hidden lg:inline"></span>

          <button
            id="db-config-toggle"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border transition-all ${useLiveSupabase ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
          >
            <Database size={14} />
            {useLiveSupabase ? "Supabase Live 🟢" : "Local Mock Base 🟡"}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* ⚙️ SUPABASE CONFIG DRAWER */}
      {/* ========================================== */}
      {showConfigDrawer && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-start justify-end p-4 transition-all" onClick={() => setShowConfigDrawer(false)}>
          <div className="bg-white text-slate-800 w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between" onClick={e => e.stopPropagation()}>
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Database className="text-emerald-500" />
                  កំណត់រចនាសម្ព័ន្ធ Supabase Database
                </h3>
                <button onClick={() => setShowConfigDrawer(false)} className="text-slate-400 hover:text-slate-600 font-extrabold text-lg">&times;</button>
              </div>
              
              <div className="mt-4 bg-[#f1f5f9] p-3.5 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  💡 តាមលំនាំដើម កម្មវិធីកំពុងដំណើរការលើ <strong>Local Storage Mock Base</strong> ដែលមានន័យថារាល់ទិន្នន័យពិធីការណ៏ និងបញ្ជីភ្ញៀវ ត្រូវបានរក្សាទុកតែនៅក្នុង Browser របស់អ្នកប៉ុណ្ណោះ ងាយស្រួលធ្វើតេស្តសាកល្បងភ្លាមៗ។
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2">
                  ប្រសិនបើចង់ភ្ជាប់ទៅកាន់ Supabase Live របស់អ្នក សូមបំពេញព័ត៌មានខាងក្រោម រួចធ្វើការចុចរក្សាទុក។
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SUPABASE URL</label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrlInput}
                    onChange={e => setSupabaseUrlInput(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SUPABASE ANON KEY</label>
                  <textarea
                    rows={4}
                    placeholder="your-anon-key-here"
                    value={supabaseAnonKeyInput}
                    onChange={e => setSupabaseAnonKeyInput(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 border-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="enableLiveDb"
                    checked={useLiveSupabase}
                    onChange={e => setUseLiveSupabase(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="enableLiveDb" className="text-xs font-bold text-slate-800 cursor-pointer">
                    បើកដំណើរការការតភ្ជាប់ Supabase Live Database
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-md focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                >
                  រក្សាទុក និងភ្ជាប់បណ្តាញ
                </button>
              </form>
            </div>
            
            <div className="pt-4 border-t text-[10px] text-slate-400 text-center font-mono">
              Wedding Guest Manager Build &bull; v1.0.0
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* 🌸 HEADER BRANDING */}
      {/* =================================================== */}
      <header className="bg-white/75 backdrop-blur-md border-b border-pink-100 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100 shadow-sm shrink-0">
                <Heart size={26} className="fill-pink-500 animate-pulse" />
              </div>
              <div className="h-12 px-3 bg-red-50/55 rounded-2xl flex items-center justify-center border border-red-100 shadow-xs shrink-0 gap-2">
                <img 
                  src="/bakong-logo.png" 
                  alt="Bakong Logo" 
                  className="h-7 w-7 rounded-full object-contain" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback stylized Bakong vector emblem */}
                <svg viewBox="0 0 100 100" className="h-6 w-6 text-red-600 fill-current shrink-0 animate-spin-slow" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#E12026" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#FFD700" strokeWidth="2.5" />
                  <path d="M50 20 C42 35 45 45 50 50 C55 45 58 35 50 20 Z" fill="#FFD700" />
                  <path d="M50 80 C42 65 45 55 50 50 C55 55 58 65 50 80 Z" fill="#FFD700" />
                  <path d="M20 50 C35 42 45 45 50 50 C45 55 35 58 20 50 Z" fill="#FFD700" />
                  <path d="M80 50 C65 42 55 45 50 50 C55 55 65 58 80 50 Z" fill="#FFD700" />
                  <circle cx="50" cy="50" r="10" fill="#E12026" stroke="#FFD700" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="4" fill="#FFD700" />
                </svg>
                <span className="text-[10px] font-black font-sans text-red-700 tracking-wider">BAKONG KHQR</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-wide font-serif">
                កម្មវិធីគ្រប់គ្រង និងចុះឈ្មោះភ្ញៀវអាពាហ៍ពិពាហ៍
                <Sparkles size={18} className="text-amber-400" />
              </h1>
              <p className="text-xs font-sans text-pink-500 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping"></span>
                កែប្រែឱ្យត្រូវនឹងស្មាតហ្វូនគ្រប់ទំហំសម្រាប់ការបញ្ចូលទិន្នន័យនៅនឹងរោងការ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Active Wedding Selection Dropdown (Only for Guest and Admin views) - Host view handles its own based on credentials */}
            {currentView !== 'host' && weddings.length > 0 && (
              <div className="relative flex-1 md:flex-initial">
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">
                  កម្មវិធីអាពាហ៍ពិពាហ៍ដែលកំពុងរៀបចំ៖
                </label>
                <div className="relative">
                  <select
                    id="wedding-selector"
                    value={activeWedding?.id || ''}
                    onChange={(e) => {
                      const selected = weddings.find(w => w.id === e.target.value);
                      if (selected) setActiveWedding(selected);
                    }}
                    className="w-full md:w-80 p-2.5 pr-8 text-xs font-serif text-slate-800 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold transition-all shadow-sm"
                  >
                    {weddings.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* 💾 CORE VIEW LAYER */}
      {/* ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 transition-all">
        {loading && (
          <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-50 flex items-center justify-center font-sans text-xs text-pink-500 font-semibold gap-2">
            <span className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
            កំពុងទាញយកទិន្នន័យ...
          </div>
        )}

        {/* ========================================== */}
        {/* ១. GUEST REGISTER VIEW */}
        {/* ========================================== */}
        {currentView === 'guest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Welcome Greeting Banner (Takes 12 columns on mobile, but is placed gracefully next to form on desktop) */}
            <div className="lg:col-span-12 bg-gradient-to-r from-wedding-pink-100 via-pink-50 to-amber-50 rounded-2xl p-6 border border-pink-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="absolute right-0 top-0 text-wedding-pink-100/30 font-serif font-black text-8xl pointer-events-none select-none">
                Love
              </div>
              <div className="relative z-10 text-center md:text-left">
                <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
                  សូមស្វាគមន៍ភ្ញៀវកិត្តិយសទាំងអស់!
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-950 font-serif leading-tight">
                  {activeWedding ? activeWedding.title : "សូមជ្រើសរើសអាពាហ៍ពិពាហ៍ខាងលើ"}
                </h2>
                <p className="text-slate-600 text-xs md:text-sm mt-1.5 max-w-2xl font-sans">
                  សូមចូលរួមផ្តល់កិត្តិយស និងចុះឈ្មោះកក់ទុកវត្តមានរបស់អ្នកនៅក្នុងថ្ងៃដ៏វិសេសវិសាលនេះ។ លោកអ្នកក៏អាចធ្វើការចងដៃជាការជូនពរអមដោយសារមនោសញ្ចេតនាផងដែរ។
                </p>
              </div>
              
              <div className="flex flex-col items-center bg-white border border-pink-100 p-3.5 rounded-xl shadow-sm text-center min-w-[150px]">
                <QrCode size={40} className="text-pink-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">QR CODE REGISTER</span>
                <span className="text-[11px] font-bold text-pink-500 font-sans mt-0.5">ស្កេនដើម្បីចុះឈ្មោះ</span>
              </div>
            </div>

            {/* Public RSVP Form (Column span 7 on desktop) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-pink-100/80 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-pink-50">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-serif">បំពេញព័ត៌មានចុះឈ្មោះ</h3>
                  <p className="text-[10px] text-slate-500">សូមបញ្ចូលព័ត៌មានឱ្យបានច្បាស់លាស់</p>
                </div>
              </div>

              {registrationSubmitted && lastSubmittedGuest ? (
                // Success Registration Card Animation
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-6 text-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                  <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-950 font-serif">ការចុះឈ្មោះបានជោគជ័យ! 🎉</h4>
                  <p className="text-slate-700 text-xs mt-2 leading-relaxed">
                    សូមអរគុណបង <strong>{lastSubmittedGuest.name}</strong> សម្រាប់ការចុះឈ្មោះចូលរួមថ្ងៃមង្គលការដ៏ឧត្តុង្គឧត្តមនេះ។
                  </p>
                  
                  <div className="my-4 bg-white p-3 rounded-lg border border-emerald-100 text-left space-y-2 text-xs divide-y divide-slate-100 font-sans">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">ទំនាក់ទំនង៖</span>
                      <span className="font-semibold text-slate-900">{lastSubmittedGuest.relation_type}</span>
                    </div>
                    {lastSubmittedGuest.companions > 0 && (
                      <div className="flex justify-between py-1 pt-2">
                        <span className="text-slate-500">ចំនួនអ្នកមកជាមួយ៖</span>
                        <span className="font-semibold text-slate-900">{lastSubmittedGuest.companions} នាក់</span>
                      </div>
                    )}
                    {lastSubmittedGuest.amount > 0 && (
                      <div className="flex justify-between py-1 pt-2">
                        <span className="text-slate-500">ថវិកាចងដៃ៖</span>
                        <span className="font-bold text-emerald-600">${lastSubmittedGuest.amount} (USD)</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mb-4 font-sans italic">
                    * ស្ថានភាពចុះឈ្មោះបច្ចុប្បន្នគឺ <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">រង់ចាំការពិនិត្យ (Pending)</span>។ សូមរង់ចាំអ្នកសម្របសម្រួលអនុម័ត វត្តមានរបស់អ្នកនឹងបង្ហាញនៅក្នុងបញ្ជីភ្ញៀវផ្លូវការទើបសម្រេច។
                  </p>

                  <button 
                    onClick={() => setRegistrationSubmitted(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow"
                  >
                    ចុះឈ្មោះភ្ញៀវផ្សេងទៀត &rarr;
                  </button>
                </div>
              ) : (
                // Standard Application Entry Form
                <form id="rsvp-form" onSubmit={handleGuestSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-name" className="block text-xs font-bold text-slate-700 mb-1">
                        ឈ្មោះភ្ញៀវពេញលេញ <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="ឧ. បូរ៉ា មហិទ្ធិឫទ្ធិ"
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label id="lbl-phone" className="block text-xs font-bold text-slate-700 mb-1">
                        លេខទូរស័ព្ទទំនាក់ទំនង
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="ឧ. 012 345 678"
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-relation" className="block text-xs font-bold text-slate-700 mb-1">
                        ប្រភេទទំនាក់ទំនង <span className="text-pink-500">*</span>
                      </label>
                      <select
                        value={guestRelation}
                        onChange={(e) => setGuestRelation(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50 font-medium"
                      >
                        <option value="ខាងកូនកំលោះ">ខាងកូនកំលោះ</option>
                        <option value="ខាងកូនក្រមុំ">ខាងកូនក្រមុំ</option>
                        <option value="មិត្តភក្តិ">មិត្តភក្តិ</option>
                        <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                      </select>
                    </div>

                    <div>
                      <label id="lbl-companions" className="block text-xs font-bold text-slate-700 mb-1">
                        ចំនួនអ្នកមកជាមួយបន្ថែម
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={guestCompanions}
                        onChange={(e) => setGuestCompanions(Number(e.target.value))}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label id="lbl-amount" className="block text-xs font-bold text-slate-700 mb-1">
                      ចំនួនប្រាក់ចងដៃជា USD ($) (បញ្ចូលបើចង់ផ្ទេរប្រាក់)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="ឧ. 50"
                        value={guestAmount}
                        onChange={(e) => setGuestAmount(e.target.value)}
                        className="w-full text-xs p-3 pl-8 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-bold bg-slate-50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">
                      * ប្រព័ន្ធនឹងបង្កើត QR កូដស្វ័យប្រវត្តិតាមការបញ្ចូលលេខទឹកប្រាក់របស់លោកអ្នក។
                    </p>
                  </div>

                  <div>
                    <label id="lbl-note" className="block text-xs font-bold text-slate-700 mb-1">
                      កំណត់សម្គាល់ ឬ ពាក្យជូនពរកូនក្រមុំកូនកំលោះ
                    </label>
                    <textarea
                      rows={3}
                      value={guestNote}
                      onChange={(e) => setGuestNote(e.target.value)}
                      placeholder="ឧ. ជូនពរឱ្យកូនប្រុសស្រី ស្រលាញ់គ្នាមិនប្រែប្រួល មានសេចក្តីសុខពេញមួយជីវិត!"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-wedding-pink-600 to-pink-500 hover:from-wedding-pink-700 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-pink-400 focus:outline-none cursor-pointer"
                  >
                    <Heart size={18} className="fill-white" />
                    ចុះឈ្មោះចូលរួមមង្គលការឥឡូវនេះ (RSVP)
                  </button>
                </form>
              )}
            </div>

            {/* Direct QR display Frame & Image (Column span 5 on desktop) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-pink-100 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center gap-2 pb-4 mb-4 border-b border-pink-50 text-left">
                <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-serif">ស្គេនផ្ទេរប្រាក់ចងដៃ (KHQR)</h3>
                  <p className="text-[10px] text-slate-500">ផ្ញើថវិកាជូនពរតាមរយៈអេបធនាគារ</p>
                </div>
              </div>

              {activeWedding ? (
                <div className="text-center w-full">
                  <div className="relative inline-block border-2 border-pink-100/60 p-4 rounded-2xl bg-gradient-to-tr from-slate-50 to-pink-50/20 max-w-[280px] mx-auto shadow-sm">
                    {/* KHQR image dynamic loading from ImgBB saved in wedding db */}
                    <img 
                      src={activeWedding.khqr_img_url} 
                      alt="KHQR Code for Wedding" 
                      className="w-full h-auto object-contain mx-auto rounded-lg shadow-inner"
                      id="khqr-image"
                      referrerPolicy="no-referrer"
                      onError={(e)=>{
                        // Fallback image in case the custom user uploaded image limits expire
                        e.currentTarget.src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.bakong.org.kh/mock-payment";
                      }}
                    />
                    
                    {parsedAmountNumber > 0 && (
                      <div className="absolute -bottom-3 inset-x-4 bg-pink-500 text-white font-mono font-black text-sm px-2.5 py-1 rounded-full shadow border-2 border-white">
                        ${parsedAmountNumber.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2 text-center text-xs text-slate-600 font-sans leading-relaxed">
                    <p className="font-bold text-slate-900 font-serif">
                      💸 វិធីសាស្រ្តផ្ទេរប្រាក់ចងដៃ៖
                    </p>
                    <p>
                      ១. បើកកម្មវិធីធនាគារណាមួយ (ABA, Acleda, Canadia ...) <br/>
                      ២. ស្កេនរូបភាព QR ខាងលើនេះដើម្បីផ្ទេរ <br/>
                    </p>
                    {parsedAmountNumber > 0 ? (
                      <p className="bg-pink-50 text-pink-700 font-bold p-2.5 rounded-lg border border-pink-100 mt-2 font-serif">
                        ទឹកប្រាក់ចងដៃដែលអ្នកបានវាយបញ្ចូលគឺ៖ <span className="text-sm font-sans">${parsedAmountNumber.toFixed(2)}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">
                        * សូមបញ្ចូលលេខទឹកប្រាក់ក្នុងទម្រង់ចុះឈ្មោះ ដើម្បីគណនាក្នុង QR
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Database size={32} className="mx-auto text-slate-300 mb-2" />
                  កំពុងរង់ចាំការជ្រើសរើសពិធីការណ៏...
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* ២. COORDINATOR VIEW (ADMIN) */}
        {/* ========================================== */}
        {currentView === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              // Admin Login Screen
              <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-pink-100 shadow-md">
                <div className="text-center pb-5 border-b border-pink-50">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mx-auto mb-3 shadow-sm">
                    <Unlock size={24} className="text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 font-serif">ផ្ទៀងផ្ទាត់គណនីអ្នករៀបចំការ (Admin)</h3>
                  <p className="text-xs text-slate-500">សូមបញ្ចូលលេខសម្ងាត់គ្រប់គ្រងជាកម្មវិធី</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះគណនី (Username)</label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="ឧ. admin123"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">លេខសម្ងាត់ (Password)</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="******"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer uppercase tracking-wider"
                  >
                    ចូលគណនីគ្រប់គ្រងការ &rarr;
                  </button>
                  
                  <div className="bg-[#FDF2F8] text-pink-500 p-3 rounded-lg text-[10px] leading-relaxed border border-pink-100 font-sans">
                    💡 <strong>មគ្គុទ្ទេសក៍សាកល្បង៖</strong> <br/>
                    - លោកអ្នកអាចប្រើប្រាស់៖ ឈ្មោះ៖ <strong>admin123</strong> / លេខសម្ងាត់៖ <strong>password123</strong> ដើម្បីចូលរួមកែសម្រួល។
                  </div>
                </form>
              </div>
            ) : (
              // Active Admin Panel
              <div className="space-y-6">
                
                {/* Custom Stats + Control Header Block */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow relative flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
                      ADMINISTRATOR PANEL • ACTIVE
                    </span>
                    <h2 className="text-xl md:text-2xl font-black font-serif leading-tight">
                      {activeWedding ? activeWedding.title : "សូមបង្កើតពិធីការណ៏ដំបូង"}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1.5 font-sans">
                      ប្រព័ន្ធគ្រប់គ្រងសមាជិកភ្ញៀវ។ លោកអ្នកមានសិទ្ធិ អនុម័ត ផ្លាស់ប្តូរ និងលុបព័ត៌មានភ្ញៀវ។
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="btn-add-wedding"
                      onClick={() => setShowAddWeddingModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      បង្កើតមង្គលការថ្មី
                    </button>
                    
                    <button
                      id="btn-admin-add-guest"
                      onClick={() => setShowAddGuestModal(true)}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} />
                      បន្ថែមភ្ញៀវដោយផ្ទាល់
                    </button>

                    <button
                      onClick={() => setIsAdminLoggedIn(false)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut size={15} />
                      ចាកចេញ
                    </button>
                  </div>
                </div>

                {/* Sub layout: Filters and List */}
                <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
                  
                  {/* Search and Filters Segment */}
                  <div className="p-4 p-5 border-b border-pink-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-50/20">
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-80">
                      <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ស្វែងរកតាមឈ្មោះ ឬ លេខទូរស័ព្ទ..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full text-xs p-3 pl-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                      />
                    </div>

                    {/* Pending / Approved State Buttons */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-hidden">
                      <button
                        onClick={() => setAdminFilter('all')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        ទាំងអស់ ({guests.length})
                      </button>
                      <button
                        onClick={() => setAdminFilter('pending')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${adminFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        រងចាំពិនិត្យ ({guests.filter(g => g.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setAdminFilter('approved')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        បានអនុម័ត ({guests.filter(g => g.status === 'approved').length})
                      </button>
                    </div>

                  </div>

                  {/* Table View Component */}
                  <div className="overflow-x-auto">
                    {filteredGuestsForAdmin.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 font-sans">
                        <Smile size={32} className="mx-auto mb-2 text-slate-300" />
                        មិនស្វែងរកឃើញទិន្នន័យភ្ញៀវណាស្របតាមតម្រូវការឡើយ។
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-pink-100 text-slate-700 text-xs font-bold uppercase">
                            <th className="py-3 px-4">ឈ្មោះភ្ញៀវ</th>
                            <th className="py-3 px-4">លេខទូរស័ព្ទ</th>
                            <th className="py-3 px-4">សមាជិកបន្ថែម</th>
                            <th className="py-3 px-4">ប្រភេទទំនាក់ទំនង</th>
                            <th className="py-3 px-4">ប្រាក់ចងដៃ</th>
                            <th className="py-3 px-4">ពាក្យជូនពរ/កំណត់សម្គាល់</th>
                            <th className="py-3 px-4 text-center">ស្ថានភាព</th>
                            <th className="py-3 px-4 text-center">សកម្មភាព</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50 text-xs">
                          {filteredGuestsForAdmin.map((g) => (
                            <tr key={g.id} className="hover:bg-pink-50/15 transition-all">
                              <td className="py-3.5 px-4 font-bold text-slate-900 font-serif text-sm">
                                {g.name}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 tracking-wider">
                                {g.phone}
                              </td>
                              <td className="py-3.5 px-4 text-center text-slate-700 font-bold">
                                {g.companions > 0 ? `+${g.companions} នាក់` : 'មកតែម្នាក់'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                                  {g.relation_type}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-black text-pink-600 text-sm">
                                {g.amount > 0 ? `$${g.amount}` : '-'}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 italic" title={g.note}>
                                {g.note || 'គ្មាន'}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {g.status === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                                    បានអនុម័ត
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-bold animate-pulse">
                                    រង់ចាំពិនិត្យ
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {g.status === 'pending' && (
                                    <button
                                      onClick={() => handleApproveGuest(g.id)}
                                      className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition shadow cursor-pointer"
                                      title="Approve RSVP"
                                    >
                                      <Check size={11} />
                                      អនុម័ត
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteGuest(g.id)}
                                    className="p-1 text-slate-400 hover:text-pink-500 rounded transition cursor-pointer"
                                    title="Delete RSVP"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* ============================================== */}
                {/* ➕ MODAL: ADD WEDDING EVENT */}
                {/* ============================================== */}
                {showAddWeddingModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-pink-100 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                      <div className="bg-slate-950 p-4 font-serif text-white flex justify-between items-center">
                        <span className="font-bold">បង្កើតកម្មវិធីមង្គលការថ្មី</span>
                        <button onClick={() => setShowAddWeddingModal(false)} className="text-xl font-bold">&times;</button>
                      </div>
                      
                      <form onSubmit={handleCreateWedding} className="p-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ឈ្មោះពិធីការណ៏អាពាហ៍ពិពាហ៍ <span className="text-pink-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newWeddingTitle}
                            onChange={(e) => setNewWeddingTitle(e.target.value)}
                            placeholder="ឧ. អាពាហ៍ពិពាហ៍កូនប្រុស ពិសិដ្ឋ & កូនស្រី ម៉ាលី"
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              គណនីម្ចាស់ការ <span className="text-pink-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={newWeddingHostUser}
                              onChange={(e) => setNewWeddingHostUser(e.target.value)}
                              placeholder="ឧ. piseth"
                              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              លេខសម្ងាត់ <span className="text-pink-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={newWeddingHostPass}
                              onChange={(e) => setNewWeddingHostPass(e.target.value)}
                              placeholder="ឧ. piseth123"
                              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            តំណភ្ជាប់រូបភាព KHQR ធនាគារ (ImgBB Link)
                          </label>
                          <input
                            type="url"
                            value={newWeddingKHQR}
                            onChange={(e) => setNewWeddingKHQR(e.target.value)}
                            placeholder="https://i.ibb.co/..."
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50 font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1 font-sans">
                            * លោកអ្នកអាចបង្ហោះរូបភាព ABA/Acleda QR របស់អ្នកទៅកាន់ ImgBB រួចចម្លងតំណភ្ជាប់ "Direct Link" មកដាក់ទីនេះ។
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddWeddingModal(false)}
                            className="flex-1 py-3 text-xs border rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            បោះបង់
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 text-xs bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow"
                          >
                            រក្សាទុកព័ត៌មាន
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* ============================================== */}
                {/* ➕ MODAL: ADD GUEST MANUALLY */}
                {/* ============================================== */}
                {showAddGuestModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-pink-100 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                      <div className="bg-slate-950 p-4 font-serif text-white flex justify-between items-center">
                        <span className="font-bold">បន្ថែមសមាជិកភ្ញៀវដោយផ្ទាល់ (Admin Entry)</span>
                        <button onClick={() => setShowAddGuestModal(false)} className="text-xl font-bold">&times;</button>
                      </div>
                      
                      <form onSubmit={handleAdminAddGuest} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះភ្ញៀវ <span className="text-pink-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={manGuestName}
                              onChange={(e) => setManGuestName(e.target.value)}
                              className="w-full text-xs p-3 border rounded-xl focus:outline-none bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ</label>
                            <input
                              type="text"
                              value={manGuestPhone}
                              onChange={(e) => setManGuestPhone(e.target.value)}
                              className="w-full text-xs p-3 border rounded-xl focus:outline-none bg-slate-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ទំនាក់ទំនង</label>
                            <select
                              value={manGuestRelation}
                              onChange={(e) => setManGuestRelation(e.target.value)}
                              className="w-full text-xs p-3 border rounded-xl bg-slate-50"
                            >
                              <option value="ខាងកូនកំលោះ">ខាងកូនកំលោះ</option>
                              <option value="ខាងកូនក្រមុំ">ខាងកូនក្រមុំ</option>
                              <option value="មិត្តភក្តិ">មិត្តភក្តិ</option>
                              <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនអ្នកមកជាមួយ</label>
                            <input
                              type="number"
                              min="0"
                              value={manGuestCompanions}
                              onChange={(e) => setManGuestCompanions(Number(e.target.value))}
                              className="w-full text-xs p-3 border rounded-xl text-center font-bold bg-slate-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">ថវិកាចងដៃ (USD)</label>
                          <input
                            type="number"
                            min="0"
                            value={manGuestAmount}
                            onChange={(e) => setManGuestAmount(e.target.value)}
                            className="w-full text-xs p-3 border rounded-xl bg-slate-50 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">កំណត់សម្គាល់</label>
                          <textarea
                            rows={2}
                            value={manGuestNote}
                            onChange={(e) => setManGuestNote(e.target.value)}
                            className="w-full text-xs p-3 border rounded-xl focus:outline-none bg-slate-50"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddGuestModal(false)}
                            className="flex-1 py-3 text-xs border rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            បោះបង់
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 text-xs bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow"
                          >
                            បន្ថែមភ្ញៀវ
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* ៣. HOST DASHBOARD VIEW */}
        {/* ========================================== */}
        {currentView === 'host' && (
          <div>
            {!isHostLoggedIn ? (
              // Host User Login Screen
              <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-pink-100 shadow-md">
                <div className="text-center pb-5 border-b border-pink-50">
                  <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mx-auto mb-3 shadow-sm border border-pink-100">
                    <Heart size={24} className="fill-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 font-serif">ផ្ទៀងផ្ទាត់គណនីម្ចាស់ដើមការ (Host)</h3>
                  <p className="text-xs text-slate-500">គណនីគូស្វាមីភរិយាផ្ទៀងផ្ទាត់របាយការណ៍សរុប</p>
                </div>

                <form onSubmit={handleHostLogin} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះគណនីម្ចាស់ការ (Host Username)</label>
                    <input
                      type="text"
                      required
                      value={hostUsername}
                      onChange={e => setHostUsername(e.target.value)}
                      placeholder="ឧ. sokha"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">លេខសម្ងាត់ (Password)</label>
                    <input
                      type="password"
                      required
                      value={hostPassword}
                      onChange={e => setHostPassword(e.target.value)}
                      placeholder="******"
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer uppercase tracking-wider"
                  >
                    ចូលពិនិត្យរបាយការណ៍ &rarr;
                  </button>
                  
                  <div className="bg-[#FDF2F8] text-pink-500 p-3 rounded-lg text-[10px] leading-relaxed border border-pink-100 font-sans">
                    💡 <strong>មគ្គុទ្ទេសក៍សាកល្បង៖</strong> <br/>
                    - លោកអ្នកអាចប្រើប្រាស់គណនីម្ចាស់ការដែលបានទុកស្រាប់៖ គណនី៖ <strong>sokha</strong> / លេខសម្ងាត់៖ <strong>sokha123</strong>។
                  </div>
                </form>
              </div>
            ) : (
              // Active Couple Dashboard Screen
              <div className="space-y-6">
                
                {/* Dashboard Welcome */}
                <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative flex flex-col md:flex-row items-center justify-between gap-5 overflow-hidden">
                  <div className="absolute right-0 top-0 text-white/5 font-serif font-black text-9xl pointer-events-none select-none">
                    Home
                  </div>
                  <div className="relative z-10 text-center md:text-left">
                    <span className="bg-pink-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
                      DASHBOARD • READ ONLY
                    </span>
                    <h2 className="text-xl md:text-2xl font-black font-serif leading-none flex items-center gap-2 justify-center md:justify-start">
                      {activeWedding ? activeWedding.title : "មង្គលការកូនប្រុសស្រី"}
                      <Heart size={20} className="fill-pink-500 text-pink-500 inline" />
                    </h2>
                    <p className="text-slate-300 text-xs mt-2 max-w-xl font-sans">
                      សូមអបអរសាទរថ្ងៃសិរីសួស្តី! លោកអ្នកអាចពិនិត្យបញ្ជីវត្តមាន ថវិកាចងដៃសរុប និងទាញយកបញ្ជីឈ្មោះភ្ញៀវពេញលេញជាឯកសារ Excel ។
                    </p>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <button 
                      onClick={() => setIsHostLoggedIn(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={14} />
                      ចាកចេញពីគណនី
                    </button>
                  </div>
                </div>

                {/* Styled Statistical Cards (3-Grid layout for desktop, single stacked on tablet/mobile) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* CARD 1: Total Registered */}
                  <div className="bg-white rounded-2xl p-5 border border-pink-100/50 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ភ្ញៀវចុះឈ្មោះសរុប</p>
                      <h3 className="text-3xl font-black text-slate-900 font-sans mt-1.5">
                        {hostStats.totalReg} <span className="text-xs text-slate-400 font-serif">នាក់</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">ចំនួនភ្ញៀវដែលបានបង្ហាញវត្តមានទាំងអស់</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                      <Users size={24} />
                    </div>
                  </div>

                  {/* CARD 2: Actual Total Attendees (Approved guests + companions) */}
                  <div className="bg-white rounded-2xl p-5 border border-pink-100/50 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">វត្តមានជាក់ស្តែង</p>
                      <h3 className="text-3xl font-black text-pink-500 font-sans mt-1.5">
                        {hostStats.totalActualAttendees} <span className="text-xs text-slate-400 font-serif">នាក់</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">គណនា៖ ភ្ញៀវអនុម័តរួច + ចំនួនអ្នកមកជាមួយ</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                      <UserCheck size={24} />
                    </div>
                  </div>

                  {/* CARD 3: Total Gift Money */}
                  <div className="bg-pink-600 rounded-2xl p-5 shadow-lg shadow-pink-200 text-white flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-pink-100 uppercase tracking-wider">សរុបថវិកាចងដៃ</p>
                      <h3 className="text-3xl font-black font-sans mt-1.5">
                        ${hostStats.totalGiftAmount.toLocaleString()} <span className="text-xs text-pink-200 font-serif">USD</span>
                      </h3>
                      <p className="text-[10px] text-pink-200 mt-1 font-sans">ថវិកាដែលបានអនុម័តរួចរាល់ទាំងស្រុង</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center text-white border border-white/20">
                      <Gift size={24} />
                    </div>
                  </div>

                </div>

                {/* Sub-distribution chart display */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Relationship Breakdown Panel */}
                  <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-pink-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 font-serif border-b pb-2 flex items-center gap-1.5">
                      <Activity size={16} className="text-pink-500" />
                      ស្ថិតិភាគីទំនាក់ទំនង
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>ខាងកូនកំលោះ</span>
                          <span>{hostStats.groomSide} នាក់</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-600 rounded-full transition-all duration-505" 
                            style={{ width: `${hostStats.totalReg > 0 ? (hostStats.groomSide / hostStats.totalReg) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>ខាងកូនក្រមុំ</span>
                          <span>{hostStats.brideSide} នាក់</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 rounded-full transition-all duration-505" 
                            style={{ width: `${hostStats.totalReg > 0 ? (hostStats.brideSide / hostStats.totalReg) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>មិត្តភក្តិ</span>
                          <span>{hostStats.friends} នាក់</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-505" 
                            style={{ width: `${hostStats.totalReg > 0 ? (hostStats.friends / hostStats.totalReg) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>ផ្សេងៗ</span>
                          <span>{hostStats.others} នាក់</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-505" 
                            style={{ width: `${hostStats.totalReg > 0 ? (hostStats.others / hostStats.totalReg) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fully functional searchable guest list with Export Excel button */}
                  <div className="lg:col-span-8 bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden flex flex-col">
                    
                    {/* List Header */}
                    <div className="p-4 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-serif">បញ្ជីវត្តមានភ្ញៀវពេញលេញ</h4>
                        <p className="text-[10px] text-slate-500">ស្វែងរក និងទាញយកឯកសាររបាយការណ៍</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="ស្វែងរកឈ្មោះ..."
                            value={hostSearchQuery}
                            onChange={e => setHostSearchQuery(e.target.value)}
                            className="text-xs p-2 pl-8 border rounded-lg w-full sm:w-48 bg-white focus:outline-none"
                          />
                        </div>

                        <button
                          id="btn-excel-export"
                          onClick={handleExportToExcel}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <FileSpreadsheet size={15} />
                          នាំចេញជា Excel
                        </button>
                      </div>
                    </div>

                    {/* Table View List for Host */}
                    <div className="overflow-x-auto flex-1">
                      {filteredGuestsForHost.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-sans">
                          មិនមានវត្តមានភ្ញៀវតាមការស្វែងរករបស់អ្នកឡើយ។
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-700 font-bold uppercase">
                              <th className="py-2.5 px-4">ឈ្មោះភ្ញៀវ</th>
                              <th className="py-2.5 px-4">លេខទូរស័ព្ទ</th>
                              <th className="py-2.5 px-4">ចំនួនអ្នករួមដំណើរ</th>
                              <th className="py-2.5 px-4">ប្រភេទទំនាក់ទំនង</th>
                              <th className="py-2.5 px-4">ប្រាក់ចងដៃ ($)</th>
                              <th className="py-2.5 px-4">ស្ថានភាព</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-pink-50">
                            {filteredGuestsForHost.map((g) => (
                              <tr key={g.id} className="hover:bg-pink-50/10">
                                <td className="py-3 px-4 font-bold text-slate-900 font-serif">{g.name}</td>
                                <td className="py-3 px-4 text-slate-600 font-sans tracking-wide">{g.phone}</td>
                                <td className="py-3 px-4 text-center">{g.companions > 0 ? `+${g.companions} នាក់` : 'មកតែម្នាក់'}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">{g.relation_type}</span>
                                </td>
                                <td className="py-3 px-4 font-mono font-black text-pink-500">${g.amount}</td>
                                <td className="py-3 px-4">
                                  {g.status === 'approved' ? (
                                    <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded text-[10px]">បានអនុម័ត</span>
                                  ) : (
                                    <span className="text-amber-600 font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.2 rounded text-[10px]">រង់ចាំពិនិត្យ</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* =================================================== */}
      {/* 🌸 LUXURY FOOTER CREATED BY THE SENIOR ARCHITECT */}
      {/* =================================================== */}
      <footer className="bg-white border-t border-pink-100 py-6 px-6 mt-12 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-serif">
            💖 បង្កើតឡើងដោយក្តីស្រឡាញ់ សម្រាប់ជាចំណងដៃអាពាហ៍ពិពាហ៍ដល់គូស្វាមីភរិយាថ្មីថ្មោងទាំងអស់។
          </p>
          <p className="font-sans text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Wedding RSVP & Manager &bull; រក្សាសិទ្ធិគ្រប់យ៉ាងធានាសុវត្ថិភាពទិន្នន័យ។
          </p>
        </div>
      </footer>

    </div>
  );
}
