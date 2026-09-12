import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface AddonItem {
  key: string;
  name: string;
  tagline: string;
  price: number;
  selected: boolean;
}

export interface InsurerQuote {
  insurer_id: string;
  insurer_name: string;
  short_name: string;
  tag: string;
  brand_color: string;
  rating: number;
  claim_settlement_ratio: string;
  cashless_garages: string;
  highlight: string;
  idv: number;
  ncb_percent: number;
  od_gross: number;
  ncb_discount: number;
  od_net: number;
  tp_amount: number;
  addons_total: number;
  net_premium: number;
  gst_amount: number;
  total_premium: number;
  selected_addons: string[];
}

export interface QuoteResponse {
  engine_capacity_cc: number;
  idv: number;
  ncb_percent: number;
  selected_addons: string[];
  addons_breakdown: AddonItem[];
  tp_base_rate: number;
  quotes: InsurerQuote[];
}

export interface ChallanRecord {
  id: number;
  challan_number: string;
  vehicle_reg_no: string;
  violation_title: string;
  violation_description: string;
  offense_date: string;
  offense_place: string;
  fine_amount: string | number;
  status: 'PENDING' | 'PAID';
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface VehicleRecord {
  id: number;
  registration_number: string;
  owner_name: string;
  masked_owner: string;
  maker_model: string;
  vehicle_class: string;
  fuel_type: string;
  engine_capacity_cc: number;
  registration_date: string;
  fitness_upto: string;
  insurance_upto: string;
  pucc_upto: string | null;
  rto_office: string;
  chassis_number_masked: string;
  engine_number_masked: string;
  status: string;
  insurance_status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  days_to_insurance_expiry: number;
  pending_fines_total: number;
  pending_challans_count: number;
  challans: ChallanRecord[];
  created_at: string;
}

export interface PolicyRecord {
  id: number;
  policy_number: string;
  vehicle_reg_no: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  insurer_name: string;
  plan_name: string;
  engine_capacity_cc: number;
  idv_amount: string | number;
  ncb_percent: number;
  od_premium: string | number;
  tp_premium: string | number;
  addons_total: string | number;
  selected_addons: string[];
  net_premium: string | number;
  gst_amount: string | number;
  total_premium: string | number;
  start_date: string;
  end_date: string;
  issued_at: string;
}

export interface RTOQuestionItem {
  id: number;
  question_text: string;
  sign_code: string;
  category: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
  order: number;
}

export interface ExamSubmissionResponse {
  total_questions: number;
  correct_answers: number;
  percentage: number;
  passing_percentage: number;
  is_passed: boolean;
  result_status: 'PASS' | 'NEEDS_IMPROVEMENT';
  detailed_results: {
    question_id: number;
    question_text: string;
    sign_code: string;
    category: string;
    options: string[];
    selected_index: number;
    correct_index: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

// API Methods
export const api = {
  getQuotes: async (params: {
    engine_capacity_cc: number;
    idv: number;
    ncb_percent: number;
    selected_addons: string[];
  }): Promise<QuoteResponse> => {
    const res = await apiClient.post<QuoteResponse>('/quotes/', params);
    return res.data;
  },

  getVehicleRC: async (regNo: string): Promise<VehicleRecord> => {
    const res = await apiClient.get<VehicleRecord>(`/vehicle/${encodeURIComponent(regNo)}/`);
    return res.data;
  },

  getChallans: async (regNo?: string, status?: string): Promise<ChallanRecord[]> => {
    const params: Record<string, string> = {};
    if (regNo) params.reg_no = regNo;
    if (status) params.status = status;
    const res = await apiClient.get<ChallanRecord[]>('/challans/', { params });
    return res.data;
  },

  payChallan: async (challanId: number) => {
    const res = await apiClient.put(`/challan/${challanId}/pay/`);
    return res.data;
  },

  checkoutPolicy: async (payload: {
    vehicle_reg_no: string;
    owner_name: string;
    owner_email: string;
    owner_phone: string;
    insurer_name: string;
    plan_name?: string;
    engine_capacity_cc: number;
    idv_amount: number;
    ncb_percent: number;
    od_premium: number;
    tp_premium: number;
    addons_total: number;
    selected_addons: string[];
    net_premium: number;
    gst_amount: number;
    total_premium: number;
  }) => {
    const res = await apiClient.post('/checkout/', payload);
    return res.data;
  },

  getVaultPolicies: async (regNo?: string, search?: string): Promise<PolicyRecord[]> => {
    if (regNo) {
      const res = await apiClient.get<PolicyRecord[]>(`/vault/${encodeURIComponent(regNo)}/`);
      return res.data;
    }
    const params = search ? { search } : {};
    const res = await apiClient.get<PolicyRecord[]>('/vault/', { params });
    return res.data;
  },

  getMockExamQuestions: async (): Promise<RTOQuestionItem[]> => {
    const res = await apiClient.get<RTOQuestionItem[]>('/mock-test/questions/');
    return res.data;
  },

  submitMockExam: async (submissions: { question_id: number; selected_index: number }[]): Promise<ExamSubmissionResponse> => {
    const res = await apiClient.post<ExamSubmissionResponse>('/mock-test/submit/', { submissions });
    return res.data;
  },
};
