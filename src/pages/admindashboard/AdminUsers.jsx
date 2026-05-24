import React, { useState, useMemo, useEffect } from "react";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserRound,
    ClipboardCheck,
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    UserCheck,
    UserX,
    UserPlus,
    MoreVertical,
    X,
    Eye,
    EyeOff,
    Trash2,
    Video
} from "lucide-react";

import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

import { getUsers, addUser, deleteUser } from "../../services/api";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            const mappedUsers = (data || []).map((u) => ({
                id: u.id,
                name: u.full_name || u.username || "Unknown",
                email: u.email || "No Email",
                role: u.role ? (u.role.toLowerCase() === "student" ? "Student" : u.role.toLowerCase() === "trainer" ? "Trainer" : u.role.toLowerCase() === "supporter" ? "Supporter" : u.role.charAt(0).toUpperCase() + u.role.slice(1)) : "Student",
                status: u.is_active ? "Active" : "Inactive",
                coursesCompleted: 0,
                coursesEnrolled: u.enrollment_count || 0,
                courseNames: u.courses || [], // Store course names
                progress: 0,
                lastLogin: "Recently",
                joined: u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—",
                joinedDate: u.date_joined ? new Date(u.date_joined) : new Date(),
            }));
            setUsers(mappedUsers);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");

    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [addUserFullName, setAddUserFullName] = useState("");
    const [addUserEmail, setAddUserEmail] = useState("");
    const [addUserPassword, setAddUserPassword] = useState("");
    const [addUserRole, setAddUserRole] = useState("");
    const [addUserCourse, setAddUserCourse] = useState("");
    const [addUserPortal, setAddUserPortal] = useState("");
    const [addUserShowPassword, setAddUserShowPassword] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const openDeleteConfirm = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const closeDeleteConfirm = () => {
        setDeleteModalOpen(false);
        setUserToDelete(null);
    };

    // Menu State
    const [activeMenuUserId, setActiveMenuUserId] = useState(null);

    const toggleMenu = (userId) => {
        setActiveMenuUserId(activeMenuUserId === userId ? null : userId);
    };

    // Click outside handler to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuUserId && !event.target.closest('.user-menu-container')) {
                setActiveMenuUserId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuUserId]);

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id)); // Optimistic update
            closeDeleteConfirm();
            // alert("User deleted successfully."); // Optional: standard alert or toast
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user. Please try again.");
        }
    };

    const closeAddUserModal = () => {
        setAddUserModalOpen(false);
        setAddUserFullName("");
        setAddUserEmail("");
        setAddUserPassword("");
        setAddUserRole("");
        setAddUserCourse("");
        setAddUserPortal("");
    };

    const handleAddUser = async () => {
        if (!addUserFullName || !addUserEmail || !addUserPassword || !addUserRole) {
            alert("Please fill in all required fields (Name, Email, Password, Role).");
            return;
        }

        try {
            await addUser({
                username: addUserFullName,
                full_name: addUserFullName,
                email: addUserEmail,
                password: addUserPassword,
                role: addUserRole.toLowerCase(),
                course_name: addUserCourse,
                portal_link: addUserPortal,
            });
            alert("User added successfully! Welcome email has been sent to the student.");
            closeAddUserModal();
            loadUsers();
        } catch (err) {
            console.error("Failed to add user", err);
            let errorMsg = "Failed to add user";
            const data = err.response?.data;

            if (data) {
                if (typeof data === 'string') errorMsg = data;
                else if (data.error) errorMsg = data.error;
                else if (data.detail) errorMsg = data.detail;
                else {
                    // Collect field errors like {"email": ["..."], "username": ["..."]}
                    const fields = Object.keys(data);
                    if (fields.length > 0) {
                        const firstField = fields[0];
                        const fieldError = data[firstField];
                        errorMsg = `${firstField}: ${Array.isArray(fieldError) ? fieldError[0] : fieldError}`;
                    }
                }
            }
            alert(`Error: ${errorMsg}`);
        }
    };

    const filteredUsers = useMemo(() => {
        let list = users.filter((u) => {
            const matchSearch =
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
            const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
            return matchSearch && matchRole && matchStatus;
        });

        if (sortKey) {
            list = [...list].sort((a, b) => {
                let va = a[sortKey];
                let vb = b[sortKey];
                if (typeof va === "string") {
                    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
                }
                return sortDir === "asc" ? va - vb : vb - va;
            });
        }
        return list;
    }, [users, searchTerm, roleFilter, statusFilter, sortKey, sortDir]);

    const stats = useMemo(() => getUsersStats(users), [users]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortKey !== columnKey) return <ChevronDown size={14} className="opacity-50" />;
        return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Nav */}
            <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/admin-dashboard">
                            <img
                                src={logo}
                                alt="AIDEAS"
                                className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                            />
                        </Link>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="hidden lg:flex items-center justify-center space-x-6">
                        <NavLink to="/admin-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                        <NavLink to="/admin-courses" icon={<BookOpen size={16} />} label="Courses" />
                        <NavLink to="/admin-users" icon={<Users size={16} />} label="Users" active />
                        <NavLink to="/admin-live-sessions" icon={<Video size={16} />} label="Live Sessions" />
                        <NavItem icon={<UserRound size={16} />} label="Instructors" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Enrollments" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Assessments" />
                    </div>

                    {/* Right: User Profile */}
                    <div className="flex items-center justify-end">
                        <div className="flex items-center space-x-3 bg-white/10 px-2.5 py-1 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all">
                            <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center font-bold text-xs text-white shadow-inner">K</div>
                            <span className="font-semibold text-xs text-white">Anitha</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage your LMS users and roles</p>
                    </div>
                    <button
                        onClick={() => setAddUserModalOpen(true)}
                        className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-900 transition-all shadow-md flex items-center gap-2"
                    >
                        <UserPlus size={18} /> + Add User
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Users" value={stats.total} icon={<Users className="text-slate-600" size={22} />} bgColor="bg-slate-100" />
                    <StatCard title="Active Users" value={stats.active} icon={<UserCheck className="text-green-600" size={22} />} bgColor="bg-green-100" />
                    <StatCard title="Inactive / Blocked" value={stats.inactiveBlocked} icon={<UserX className="text-red-600" size={22} />} bgColor="bg-red-100" />
                    <StatCard title="New (Last 7 days)" value={stats.newLast7} icon={<UserPlus className="text-amber-600" size={22} />} bgColor="bg-amber-100" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <Filter size={18} className="text-slate-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
                        >
                            <option value="All Roles">All Roles</option>
                            <option value="Student">Student</option>
                            <option value="Trainer">Trainer</option>
                            <option value="Supporter">Supporter</option>
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium">Loading users...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button onClick={() => handleSort("name")} className="flex items-center gap-1">
                                            User <SortIcon columnKey="name" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button onClick={() => handleSort("role")} className="flex items-center gap-1">
                                            Role <SortIcon columnKey="role" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button onClick={() => handleSort("status")} className="flex items-center gap-1">
                                            Status <SortIcon columnKey="status" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="w-10 py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        <td className="py-3 px-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{user.role}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm">
                                                <span className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700">
                                            {user.courseNames && user.courseNames.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {user.courseNames.map((course, idx) => (
                                                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium w-fit">
                                                            {course}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No courses</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-800" style={{ width: `${user.progress}%` }} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{user.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{user.joined}</td>
                                        <td className="py-3 px-4 relative user-menu-container">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(user.id);
                                                }}
                                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {activeMenuUserId === user.id && (
                                                <div className="absolute right-8 top-8 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeleteConfirm(user);
                                                            setActiveMenuUserId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center bg-white">
                            <p className="text-slate-500 font-medium">
                                {searchTerm || roleFilter !== "All Roles" || statusFilter !== "All Status"
                                    ? "No users match your filters."
                                    : "No users found in the database."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeDeleteConfirm} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete User?</h3>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{userToDelete?.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={closeDeleteConfirm}
                                className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-md transition-colors"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {addUserModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeAddUserModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-start justify-between p-6 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
                                </div>
                            </div>
                            <button onClick={closeAddUserModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 pb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input type="text" value={addUserFullName} onChange={(e) => setAddUserFullName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" value={addUserEmail} onChange={(e) => setAddUserEmail(e.target.value)} placeholder="e.g. john@example.com" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input type={addUserShowPassword ? "text" : "password"} value={addUserPassword} onChange={(e) => setAddUserPassword(e.target.value)} placeholder="Minimum 8 chars" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select value={addUserRole} onChange={(e) => setAddUserRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select</option>
                                        <option value="Student">Student</option>
                                        <option value="Trainer">Trainer</option>
                                        <option value="Supporter">Supporter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                                    <select
                                        value={addUserCourse}
                                        onChange={(e) => setAddUserCourse(e.target.value)}
                                        disabled={addUserRole !== "Student"}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white ${addUserRole !== "Student" ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
                                    >
                                        <option value="">Select</option>
                                        <option value="Python Backend _2601_ 10AM">Python Backend</option>
                                        <option value="Java Backend _2601_ 10AM">Java Backend</option>
                                        <option value="DevOps Backend _2601_ 10AM">DevOps Backend</option>
                                        <option value="AI/ML _2601_ 10AM">AI/ML</option>
                                        <option value="React JS Backend _2601_ 10AM">React JS</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Portal Link (LMS)</label>
                                <input
                                    type="url"
                                    value={addUserPortal}
                                    onChange={(e) => setAddUserPortal(e.target.value)}
                                    placeholder="e.g. https://lms.portal.com"
                                    disabled={addUserRole !== "Student"}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${addUserRole !== "Student" ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={closeAddUserModal} className="px-4 py-2 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Add User</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, bgColor }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{title}</p>
            </div>
        </div>
    );
}

function NavLink({ to, icon, label, active = false }) {
    return (
        <Link
            to={to}
            className={`flex items-center space-x-1.5 py-1 px-1 transition-all border-b-2 ${active ? "text-white border-white font-bold opacity-100" : "text-white/70 border-transparent hover:text-white"}`}
        >
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </Link>
    );
}

function NavItem({ icon, label }) {
    return (
        <div className="flex items-center space-x-1.5 py-1 px-1 text-white/70 hover:text-white cursor-pointer opacity-80">
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </div>
    );
}

function getUsersStats(users) {
    const total = users.length;
    const active = users.filter(u => u.status === "Active").length;
    const inactiveBlocked = users.filter(u => u.status === "Inactive" || u.status === "Blocked").length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newLast7 = users.filter(u => u.joinedDate >= sevenDaysAgo).length;

    return {
        total,
        active,
        inactiveBlocked,
        newLast7
    };
}
