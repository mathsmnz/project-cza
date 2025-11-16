import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type {
  CompleteRegistrationRequest,
  InvitationResponse,
  Page,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  PasswordResetRequest,
  PlatformStats,
  Project,
  TokenValidationResponse,
  UpdateUserRequest,
  UserCreationRequest,
  UserResponse,
} from '@/types/types.ts'

type QueueItem = {
  resolve: (token: string) => void
  reject: (error: any) => void
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_PATH,
  withCredentials: true
})

let isRefreshing = false
let refreshQueue: QueueItem[] = []

function processQueue(error: any, token: string | null = null) {
  refreshQueue.forEach((item) => {
    if (error) item.reject(error)
    else item.resolve(token!)
  })
  refreshQueue = []
}

api.interceptors.request.use(
  (config) => {
    try {
      const auth = useAuthStore()
      if (auth.accessToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${auth.accessToken}`
      }
    } catch (err) {
      console.error('Request interceptor error:', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error)
    }
    if (originalRequest._retry) {
      return Promise.reject(error)
    }
    originalRequest._retry = true
    const auth = useAuthStore()
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject: (error) => reject(error)
        })
      })
    }
    isRefreshing = true
    try {
      const newToken = await auth.refresh()
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)
      await auth.logout()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

/**
 * Fetches general platform statistics from the backend.
 *
 * @returns A Promise that resolves to the {@link PlatformStats} object.
 *
 * @example
 * ```ts
 * const stats = await fetchPlatformStats();
 * console.log('Total users:', stats.userCount);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const fetchPlatformStats = async (): Promise<PlatformStats> => {
  try {
    const response = await api.get<PlatformStats>('api/stats/v1/platform')
    return response.data
  } catch (err) {
    console.error('Failed to fetch stats:', err)
    throw err
  }
}

/**
 * Sends an invitation request to create a new user invitation.
 *
 * @param request - The invitation details, including email, role, and optional project IDs.
 * @returns A Promise that resolves to the {@link InvitationResponse} object from the backend.
 *
 * @example
 * ```ts
 * const invitation = await inviteUser({
 * email: 'newuser@example.com',
 * role: 'USER',
 * projectIds: ['proj-123', 'proj-456']
 * });
 * console.log('Invitation link:', invitation.registrationLink);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const inviteUser = async (
  request: UserCreationRequest
): Promise<InvitationResponse> => {
  try {
    const response = await api.post<InvitationResponse>('/api/users/v1/registration/invitations', request)
    return response.data
  } catch (error) {
    console.error('Failed to invite user:', error)
    throw error
  }
}

/**
 * Retrieves an existing user invitation using its unique token.
 *
 * @param token - The unique invitation token provided to the user.
 * @returns A Promise that resolves to the {@link InvitationResponse} object retrieved from the backend.
 *
 * @example
 * ```ts
 * const invitation = await getInvitationByToken('abc123token');
 * console.log('Invitation for:', invitation.email);
 * ```
 *
 * @throws If the API request fails or the invitation is not found, the error is logged and rethrown.
 */
export const getInvitationByToken = async (
  token: string
): Promise<InvitationResponse> => {
  try {
    const response = await api.get<InvitationResponse>('/api/users/v1/registration/invitations/invite', {
      params: { token },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch invitation by token:', error);
    throw error;
  }
};

/**
 * Completes user registration using a valid invitation token.
 *
 * @param token - The unique invitation token from the registration link.
 * @param request - The user's registration details, including name, username, and password.
 * @returns A Promise that resolves to the {@link UserResponse} object returned from the backend.
 *
 * @example
 * ```ts
 * const completedUser = await completeRegistration('abc123token', {
 *   name: 'Jane Doe',
 *   username: 'jane.doe',
 *   password: 'StrongPassword123!'
 * });
 * console.log('User registered successfully:', completedUser.username);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const completeRegistration = async (
  token: string,
  request: CompleteRegistrationRequest
): Promise<UserResponse> => {
  try {
    const response = await api.post<UserResponse>(`/api/users/v1/registration/${token}`, request);
    return response.data;
  } catch (error) {
    console.error(`Failed to complete registration for token "${token}":`, error);
    throw error;
  }
};


/**
 * Fetches a paginated list of users from the API.
 *
 * @param page - The page number to retrieve (0-indexed). Defaults to 0.
 * @param size - The number of items per page. Defaults to 10.
 * @param sort - The sort parameter, e.g., `"name,asc"`. Defaults to `"name,asc"`.
 * @returns A Promise that resolves to a {@link Page} of {@link UserResponse} objects.
 *
 * @example
 * ```ts
 * const firstPageOfUsers = await fetchUserInfo(0, 20, 'lastName,asc');
 * console.log(firstPageOfUsers.content);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const fetchUserInfo = async (
  page = 0,
  size = 10,
  sort = 'name,asc'
): Promise<Page<UserResponse>> => {
  try {
    const response = await api.get<Page<UserResponse>>(`api/users/v1/`, {
      params: { page, size, sort }
    })
    return response.data
  } catch (err) {
    console.error('Failed to fetch users:', err)
    throw err
  }
}

/**
 * Updates an existing user’s information on the backend.
 *
 * @param userInfo - The user object containing the ID and fields to be updated.
 * @returns A Promise that resolves when the update is successful.
 *
 * @example
 * ```ts
 * await updateUser({
 * id: 1,
 * name: 'Johnathan',
 * email: 'john.doe.new@example.com',
 * // ... other fields
 * });
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const updateUser = async (userInfo: UserResponse): Promise<void> => {
  try {
    const updateUserRequest : UpdateUserRequest = {
      username: userInfo.username,
      name: userInfo.name,
      lastName: userInfo.lastName,
      email: userInfo.email,
      userType: userInfo.role
    }
    await api.put(`/api/users/v1/${userInfo.id}`, updateUserRequest)
    console.log(`User ${userInfo.id} updated successfully`)
  } catch (err) {
    console.error('Failed to update user:', err)
    throw err
  }
}

/**
 * Fetches a paginated list of projects from the API.
 *
 * @param page - The page number to retrieve (0-indexed). Defaults to 0.
 * @param size - The number of items per page. Defaults to 10.
 * @param sort - The sort parameter, e.g., `"name,asc"`. Defaults to `"name,asc"`.
 * @returns A Promise that resolves to a {@link Page} of {@link Project} objects.
 *
 * @example
 * ```ts
 * const projects = await fetchProjects(0, 5, 'createdAt,desc');
 * console.log(projects.content);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const fetchProjects = async (
  page = 0,
  size = 10,
  sort = 'name,asc'
): Promise<Page<Project>> => {
  try {
    const response = await api.get<Page<Project>>('/api/projects/v1/', {
      params: { page, size, sort }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    throw error
  }
}

/**
 * Fetches a paginated list of all user invitations.
 *
 * @param page - The page number to retrieve (0-indexed). Defaults to 0.
 * @param size - The number of invitations per page. Defaults to 10.
 * @param sort - A sort expression, e.g., `"createdAt,desc"`. Defaults to `"createdAt,desc"`.
 * @returns A Promise that resolves to a {@link Page} of {@link InvitationResponse} objects.
 *
 * @example
 * ```ts
 * const pendingInvitations = await fetchInvitations(0, 20, 'createdAt,desc');
 * console.log(pendingInvitations.content);
 * ```
 *
 * @throws If the API request fails, the error is logged and rethrown.
 */
export const fetchInvitations = async (
  page = 0,
  size = 10,
  sort = 'createdAt,desc'
): Promise<Page<InvitationResponse>> => {
  try {
    const response = await api.get<Page<InvitationResponse>>('/api/users/v1/registration/invitations', {
      params: { page, size, sort }
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    throw error
  }
}

/**
 * Initiates a password recovery process for a given email.
 *
 * @param {PasswordRecoveryRequest} request - The email address to send the recovery link to.
 * @returns {Promise<PasswordRecoveryResponse>} A promise resolving with the recovery request details.
 *
 * @example
 * ```ts
 * const response = await requestPasswordRecovery({ email: 'user@example.com' });
 * console.log(response.message);
 * ```
 *
 * @throws Logs and rethrows an error if the API request fails.
 */
export const requestPasswordRecovery = async (
  request: PasswordRecoveryRequest
): Promise<PasswordRecoveryResponse> => {
  try {
    const response = await api.post<PasswordRecoveryResponse>(
      '/api/recovery/v1/request',
      request
    )
    return response.data
  } catch (err) {
    console.error('Failed to request password recovery:', err)
    throw err
  }
}

/**
 * Validates a password recovery token and, if valid, returns the associated recovery details.
 *
 * @param token - The recovery token to validate.
 * @returns A Promise resolving with {@link TokenValidationResponse}, containing
 *          both a validity flag and the recovery entity (if valid).
 *
 * @example
 * ```ts
 * const { valid, recovery } = await fetchRecoveryToken('abc123');
 * if (valid && recovery) {
 *   console.log(`Token for ${recovery.email} expires at ${recovery.expiryDate}`);
 * }
 * ```
 *
 * @throws Logs and rethrows an error if the API request fails.
 */
export const fetchRecoveryToken = async (
  token: string
): Promise<TokenValidationResponse> => {
  try {
    const response = await api.get<TokenValidationResponse>(
      `/api/recovery/v1/token`,
      { params: { token } }
    );
    return response.data;
  } catch (err) {
    console.error('Failed to fetch recovery token:', err);
    throw err;
  }
};

/**
 * Validates whether a given password recovery token is still valid.
 *
 * @param {string} token - The recovery token to validate.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the token is valid, `false` otherwise.
 *
 * @example
 * ```ts
 * const isValid = await validateRecoveryToken('abc123');
 * if (isValid) {
 *   console.log('Token is valid!');
 * }
 * ```
 *
 * @throws Logs and rethrows an error if the API request fails.
 */
export const validateRecoveryToken = async (token: string): Promise<boolean> => {
  try {
    const response = await api.get<{ valid: boolean }>(
      '/api/users/v1/recovery/validate',
      { params: { token } }
    )
    return response.data.valid
  } catch (err) {
    console.error('Failed to validate recovery token:', err)
    throw err
  }
}

/**
 * Resets the user's password using a valid recovery token.
 *
 * @param {PasswordResetRequest} request - The new password and associated recovery token.
 * @returns {Promise<PasswordRecoveryResponse>} A promise resolving with the reset confirmation details.
 *
 * @example
 * ```ts
 * const response = await resetPassword({
 *   token: 'abc123',
 *   newPassword: 'NewSecurePassword!23'
 * });
 * console.log('Password reset:', response.success);
 * ```
 *
 * @throws Logs and rethrows an error if the API request fails.
 */
export const resetPassword = async (
  request: PasswordResetRequest
): Promise<PasswordRecoveryResponse> => {
  try {
    const response = await api.post<PasswordRecoveryResponse>(
      '/api/recovery/v1/reset',
      request
    )
    return response.data
  } catch (err) {
    console.error('Failed to reset password:', err)
    throw err
  }
}

/**
 * Fetches all password recovery requests (paginated)
 *
 * @param page - Page number (0-indexed)
 * @param size - Number of items per page
 * @param sort - Sorting order
 * @returns A Promise resolving to a {@link Page} of {@link PasswordRecoveryResponse}
 *
 * @example
 * ```ts
 * const recoveryPage = await fetchAllPasswordRecoveries(0, 10)
 * console.log(recoveryPage.content.map(r => r.email))
 * ```
 */
export const fetchAllPasswordRecoveries = async (
  page = 0,
  size = 10,
  sort = 'email,asc'
): Promise<Page<PasswordRecoveryResponse>> => {

  const response = await api.get<Page<PasswordRecoveryResponse>>('/api/recovery/v1/', {
    params: { page, size, sort }
  })
  return response.data
}

export default api
