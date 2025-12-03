
import React, { useState } from 'react';
import { User, School, MapPin, Plus, X, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileTabProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userProfile, setUserProfile }) => {
  const [name, setName] = useState(userProfile.name);
  const [newClass, setNewClass] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleSaveName = () => {
    setUserProfile({ ...userProfile, name });
    alert('个人信息已更新');
  };

  const addClass = () => {
    if (newClass.trim() && !userProfile.myClasses.includes(newClass.trim())) {
      setUserProfile({
        ...userProfile,
        myClasses: [...userProfile.myClasses, newClass.trim()]
      });
      setNewClass('');
    }
  };

  const removeClass = (cls: string) => {
    setUserProfile({
      ...userProfile,
      myClasses: userProfile.myClasses.filter(c => c !== cls)
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !userProfile.myLocations.includes(newLocation.trim())) {
      setUserProfile({
        ...userProfile,
        myLocations: [...userProfile.myLocations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setUserProfile({
      ...userProfile,
      myLocations: userProfile.myLocations.filter(l => l !== loc)
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">我的档案</h1>
        <p className="text-sm text-gray-500">管理个人信息及常用选项</p>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <User className="text-blue-600" size={20} />
            <h2 className="font-bold text-gray-800">基本信息</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入您的姓名"
            />
            <button 
              onClick={handleSaveName}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Save size={16} /> 保存
            </button>
          </div>
        </div>

        {/* Classes Management */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <School className="text-orange-600" size={20} />
            <h2 className="font-bold text-gray-800">我负责的班级</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {userProfile.myClasses.map(cls => (
              <span key={cls} className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                {cls}
                <button onClick={() => removeClass(cls)} className="hover:text-red-500"><X size={14} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="添加班级 (如：高三1班)"
              className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addClass()}
            />
            <button onClick={addClass} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Plus size={20}/></button>
          </div>
        </div>

        {/* Locations Management */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <MapPin className="text-green-600" size={20} />
            <h2 className="font-bold text-gray-800">常用地点</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {userProfile.myLocations.map(loc => (
              <span key={loc} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {loc}
                <button onClick={() => removeLocation(loc)} className="hover:text-red-500"><X size={14} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="添加地点 (如：美术教室)"
              className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addLocation()}
            />
            <button onClick={addLocation} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Plus size={20}/></button>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>TeacherFocus v1.2</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
