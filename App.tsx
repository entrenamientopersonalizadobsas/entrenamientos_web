import React, { useState, useCallback, useEffect } from 'react';
import PlannerView from './components/PlannerView';
import TrackerView from './components/TrackerView';
import SeguimientoView from './components/SeguimientoView';
import ResumenView from './components/ResumenView';
import MuscleAnalysisView from './components/MuscleAnalysisView';
import CompositionView from './components/CompositionView';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import type { 
    WorkoutPlan, WorkoutLog, DailyPlan, DailyLog, MonthlyGoals, WeeklyGoals, 
    ExerciseList, MainExerciseData, CompositionLog, CompositionRecord,
    AllUsersData, UserData
} from './types';
import { CalendarIcon, ClipboardListIcon, ChartBarIcon, DocumentTextIcon, ChartPieIcon, BodyIcon, LogoutIcon, UserCircleIcon } from './components/icons';

type Tab = 'planner' | 'tracker' | 'resumen' | 'composition' | 'muscleAnalysis' | 'seguimiento' | 'profile';

const getStoredItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const getSessionItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from sessionStorage key “${key}”:`, error);
        return defaultValue;
    }
};

function App() {
  const [allUsersData, setAllUsersData] = useState<AllUsersData>(() => {
    const data = getStoredItem('allUsersData', {});
    // Create a default user if none exist
    if (Object.keys(data).length === 0) {
        const defaultUser: UserData = {
            profile: { username: 'curmove', email: 'test@curmove.com', name: 'Test User', password: '1234' },
            plan: {}, log: {}, monthlyGoals: {}, weeklyGoals: {},
            customWarmupExercises: {}, customMainExercises: {}, compositionLog: {}
        };
        return { 'curmove': defaultUser };
    }
    return data;
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => getSessionItem('currentUser', null));
  const [activeTab, setActiveTab] = useState<Tab>('planner');

  useEffect(() => {
    window.localStorage.setItem('allUsersData', JSON.stringify(allUsersData));
  }, [allUsersData]);

  useEffect(() => {
    if (currentUser) {
        window.sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        window.sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);
  
  const handleLogin = (username: string, password: string): boolean => {
    const user = allUsersData[username];
    if (user && user.profile.password === password) {
        setCurrentUser(username);
        return true;
    }
    return false;
  };

  const handleRegister = (username: string, password: string, email: string): boolean => {
    if (allUsersData[username]) {
        return false; // User already exists
    }
    const newUser: UserData = {
        profile: { username, password, email, name: 'Nuevo Usuario' },
        plan: {}, log: {}, monthlyGoals: {}, weeklyGoals: {},
        customWarmupExercises: {}, customMainExercises: {}, compositionLog: {}
    };
    setAllUsersData(prev => ({...prev, [username]: newUser}));
    setCurrentUser(username);
    return true;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('planner');
  };

  const updateUserSpecificData = (key: keyof Omit<UserData, 'profile'>, data: any) => {
    if (!currentUser) return;
    setAllUsersData(prev => ({
        ...prev,
        [currentUser]: {
            ...prev[currentUser],
            [key]: data
        }
    }));
  };

  const updatePlan = useCallback((week: number, day: number, dailyPlan: DailyPlan) => {
    if(!currentUser) return;
    const currentPlan = allUsersData[currentUser].plan;
    const newPlan = {
      ...currentPlan,
      [week]: {
        ...currentPlan[week],
        [day]: dailyPlan
      }
    };
    updateUserSpecificData('plan', newPlan);
  }, [currentUser, allUsersData]);

  const saveDailyLog = useCallback((week: number, day: number, dailyLog: DailyLog) => {
    if(!currentUser) return;
    const currentLog = allUsersData[currentUser].log;
    const newLog = {
      ...currentLog,
      [week]: {
        ...currentLog[week],
        [day]: dailyLog
      }
    };
    updateUserSpecificData('log', newLog);
  }, [currentUser, allUsersData]);
  
  const createUpdater = <T, K extends keyof Omit<UserData, 'profile'>>(dataKey: K) => {
      return useCallback((id: number, value: T) => {
          if (!currentUser) return;
          const currentData = allUsersData[currentUser][dataKey] as { [key: number]: T };
          const newData = { ...currentData };
          if (value) {
              newData[id] = value;
          } else {
              delete newData[id];
          }
          updateUserSpecificData(dataKey, newData);
      }, [currentUser, allUsersData]);
  };
  
  const updateMonthlyGoals = createUpdater<string, 'monthlyGoals'>('monthlyGoals');
  const updateWeeklyGoals = createUpdater<string, 'weeklyGoals'>('weeklyGoals');
  
  const addCustomWarmupExercise = useCallback((joint: string, exercise: string) => {
    if(!currentUser) return;
    const currentData = allUsersData[currentUser].customWarmupExercises;
    const newCustom = { ...currentData };
    const jointExercises = newCustom[joint] || [];
    if (!jointExercises.includes(exercise)) {
        newCustom[joint] = [...jointExercises, exercise];
    }
    updateUserSpecificData('customWarmupExercises', newCustom);
  }, [currentUser, allUsersData]);

  const deleteCustomWarmupExercise = useCallback((joint: string, exercise: string) => {
    if(!currentUser) return;
    const currentData = allUsersData[currentUser].customWarmupExercises;
    const newCustom = { ...currentData };
    const jointExercises = newCustom[joint] || [];
    newCustom[joint] = jointExercises.filter(ex => ex !== exercise);
    if (newCustom[joint].length === 0) {
        delete newCustom[joint];
    }
    updateUserSpecificData('customWarmupExercises', newCustom);
  }, [currentUser, allUsersData]);

   const addCustomMainExercise = useCallback((muscleGroup: string, pattern: string, exercise: string) => {
    if(!currentUser) return;
    const currentData = allUsersData[currentUser].customMainExercises;
    const newCustom = JSON.parse(JSON.stringify(currentData));
    if (!newCustom[muscleGroup]) newCustom[muscleGroup] = {};
    if (!newCustom[muscleGroup][pattern]) newCustom[muscleGroup][pattern] = [];
    if (!newCustom[muscleGroup][pattern].includes(exercise)) {
        newCustom[muscleGroup][pattern].push(exercise);
    }
    updateUserSpecificData('customMainExercises', newCustom);
   }, [currentUser, allUsersData]);

   const deleteCustomMainExercise = useCallback((muscleGroup: string, pattern: string, exercise: string) => {
    if(!currentUser) return;
    const currentData = allUsersData[currentUser].customMainExercises;
    const newCustom = JSON.parse(JSON.stringify(currentData));
    if (newCustom[muscleGroup]?.[pattern]) {
        newCustom[muscleGroup][pattern] = newCustom[muscleGroup][pattern].filter((ex: string) => ex !== exercise);
        if (newCustom[muscleGroup][pattern].length === 0) delete newCustom[muscleGroup][pattern];
        if (Object.keys(newCustom[muscleGroup]).length === 0) delete newCustom[muscleGroup];
    }
    updateUserSpecificData('customMainExercises', newCustom);
   }, [currentUser, allUsersData]);

  const updateCompositionLog = useCallback((record: CompositionRecord) => {
    if(!currentUser) return;
    const currentLog = allUsersData[currentUser].compositionLog;
    const newLog = JSON.parse(JSON.stringify(currentLog));
    const { year, month } = record;
    if (!newLog[year]) newLog[year] = {};
    newLog[year][month] = record;
    updateUserSpecificData('compositionLog', newLog);
  }, [currentUser, allUsersData]);
  
  const handleUpdateProfile = useCallback((name: string, email: string) => {
      if (!currentUser) return;
      setAllUsersData(prev => {
          const updatedUser = { ...prev[currentUser] };
          updatedUser.profile.name = name;
          updatedUser.profile.email = email;
          return { ...prev, [currentUser]: updatedUser };
      });
  }, [currentUser]);

  const handleChangePassword = useCallback((currentPassword: string, newPassword: string): boolean => {
      if (!currentUser) return false;
      const user = allUsersData[currentUser];
      if (user.profile.password !== currentPassword) return false;

      setAllUsersData(prev => {
          const updatedUser = { ...prev[currentUser] };
          updatedUser.profile.password = newPassword;
          return { ...prev, [currentUser]: updatedUser };
      });
      return true;
  }, [currentUser, allUsersData]);

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }
  
  const currentUserData = allUsersData[currentUser];

  const navButtons: {tab: Tab, label: string, icon: React.ReactNode, activeClass: string}[] = [
      { tab: 'planner', label: 'Planificador', icon: <CalendarIcon className="w-5 h-5"/>, activeClass: 'bg-yellow-600 text-white' },
      { tab: 'tracker', label: 'Registro', icon: <ClipboardListIcon className="w-5 h-5" />, activeClass: 'bg-violet-600 text-white' },
      { tab: 'resumen', label: 'Resumen', icon: <DocumentTextIcon className="w-5 h-5" />, activeClass: 'bg-yellow-600 text-white' },
      { tab: 'composition', label: 'Composición', icon: <BodyIcon className="w-5 h-5" />, activeClass: 'bg-yellow-600 text-white' },
      { tab: 'muscleAnalysis', label: 'Análisis', icon: <ChartPieIcon className="w-5 h-5" />, activeClass: 'bg-violet-600 text-white' },
      { tab: 'seguimiento', label: 'Seguimiento', icon: <ChartBarIcon className="w-5 h-5" />, activeClass: 'bg-violet-600 text-white' },
  ];

  const headerNav = (isMobile: boolean) => {
    const buttonClass = isMobile ? 'px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 flex items-center gap-1.5' : 'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2';
    const activeClass = (tab: Tab) => activeTab === tab ? navButtons.find(b=>b.tab === tab)?.activeClass : 'text-gray-300 hover:bg-gray-600';
    
    return navButtons.map(({tab, label, icon}) => (
        <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${buttonClass} ${activeClass(tab)}`}
        >
            {icon} {!isMobile && label}
            {isMobile && <span className="sm:hidden">{label}</span>}
        </button>
    ));
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        <span className="text-white">CUR</span><span className="text-yellow-400">MOVE</span>
                    </h1>
                     <button
                        key="profile"
                        onClick={() => setActiveTab('profile')}
                        className={`p-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${activeTab === 'profile' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        title="Perfil"
                    >
                        <UserCircleIcon className="w-5 h-5"/>
                    </button>
                </div>

                <nav className="hidden lg:flex items-center space-x-1 bg-gray-700 p-1 rounded-lg">
                    {headerNav(false)}
                </nav>
                <button onClick={handleLogout} title="Cerrar Sesión" className="p-2 rounded-lg bg-red-800 hover:bg-red-700 transition-colors">
                    <LogoutIcon className="w-5 h-5 text-white" />
                </button>
            </div>
             <nav className="lg:hidden flex flex-wrap justify-center gap-2 bg-gray-700/50 p-2 rounded-lg mb-2">
                {headerNav(true)}
            </nav>
        </div>
      </header>

      <main className="container mx-auto px-0 md:px-4 py-4">
        {activeTab === 'profile' && <ProfileView profile={currentUserData.profile} onUpdateProfile={handleUpdateProfile} onChangePassword={handleChangePassword} />}
        {activeTab === 'planner' && <PlannerView 
            plan={currentUserData.plan} 
            updatePlan={updatePlan} 
            monthlyGoals={currentUserData.monthlyGoals} 
            updateMonthlyGoals={updateMonthlyGoals} 
            weeklyGoals={currentUserData.weeklyGoals} 
            updateWeeklyGoals={updateWeeklyGoals}
            customWarmupExercises={currentUserData.customWarmupExercises}
            addCustomWarmupExercise={addCustomWarmupExercise}
            deleteCustomWarmupExercise={deleteCustomWarmupExercise}
            customMainExercises={currentUserData.customMainExercises}
            addCustomMainExercise={addCustomMainExercise}
            deleteCustomMainExercise={deleteCustomMainExercise}
            />}
        {activeTab === 'tracker' && <TrackerView plan={currentUserData.plan} log={currentUserData.log} saveDailyLog={saveDailyLog} updatePlan={updatePlan} />}
        {activeTab === 'resumen' && <ResumenView plan={currentUserData.plan} />}
        {activeTab === 'composition' && <CompositionView log={currentUserData.compositionLog} updateLog={updateCompositionLog} />}
        {activeTab === 'muscleAnalysis' && <MuscleAnalysisView plan={currentUserData.plan} />}
        {activeTab === 'seguimiento' && <SeguimientoView plan={currentUserData.plan} log={currentUserData.log} monthlyGoals={currentUserData.monthlyGoals} weeklyGoals={currentUserData.weeklyGoals} />}
      </main>
      
      <footer className="text-center py-4 mt-8 border-t border-gray-800">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} CURMOVE. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
