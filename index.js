import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle, CheckCircle, PlusCircle, Trash2, Edit, Save, XCircle, LogIn, LogOut, UserPlus, Users, Briefcase, Phone, Mail, IdCard, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils"

// Interfaces
interface Ticket {
    idTicket: string;
    tipoDeTicket: string;
    quienReporta: string;
    fecha: string;
    estatus: string;
    asesorQueAtiende: string;
    empresa: string;
    descripcion: string; // Added description
}

interface Empresa {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
    nombreDeContacto: string;
}

interface Asesor {
    nombre: string;
    telefono: string;
    correo: string;
    numeroDeTrabajador: string;
}

interface Cliente {
    nombre: string;
    correo: string;
    empresa: string;
}

interface User {
    id: string;
    username: string;
    password: string; // In a real app, this should be hashed.
    role: 'admin' | 'user'; // Added role for authorization
}

// Mock Data (for demonstration purposes)
const initialEmpresas: Empresa[] = [
    { nombre: 'TechCorp Solutions', direccion: '123 Main St', telefono: '555-1234', correo: 'info@techcorp.com', nombreDeContacto: 'Alice Smith' },
    { nombre: 'Global Innovations', direccion: '456 Oak Ave', telefono: '555-5678', correo: 'sales@global.com', nombreDeContacto: 'Bob Johnson' },
    { nombre: 'DataSys Systems', direccion: '789 Pine Ln', telefono: '555-9012', correo: 'support@datasys.com', nombreDeContacto: 'Charlie Brown' },
];

const initialAsesores: Asesor[] = [
    { nombre: 'Ana García', telefono: '555-2468', correo: 'ana.garcia@example.com', numeroDeTrabajador: '12345' },
    { nombre: 'Luis Martínez', telefono: '555-1357', correo: 'luis.martinez@example.com', numeroDeTrabajador: '67890' },
];

const initialClientes: Cliente[] = [
    { nombre: 'Carlos Pérez', correo: 'carlos.perez@client1.com', empresa: 'TechCorp Solutions' },
    { nombre: 'Laura Rodríguez', correo: 'laura.rodriguez@client2.com', empresa: 'Global Innovations' },
];

const initialTickets: Ticket[] = [
    { idTicket: '1', tipoDeTicket: 'Soporte', quienReporta: 'Carlos Pérez', fecha: '2024-07-28', estatus: 'Abierto', asesorQueAtiende: 'Ana García', empresa: 'TechCorp Solutions', descripcion: 'Problema de inicio de sesión' },
    { idTicket: '2', tipoDeTicket: 'Incidencia', quienReporta: 'Laura Rodríguez', fecha: '2024-07-27', estatus: 'En Proceso', asesorQueAtiende: 'Luis Martínez', empresa: 'Global Innovations', descripcion: 'Error al procesar pago' },
    { idTicket: '3', tipoDeTicket: 'Consulta', quienReporta: 'Carlos Pérez', fecha: '2024-07-26', estatus: 'Cerrado', asesorQueAtiende: 'Ana García', empresa: 'TechCorp Solutions', descripcion: 'Consulta sobre la API' },
];

const initialUsers: User[] = [
    { id: '1', username: 'admin', password: 'password', role: 'admin' }, // Don't store passwords in plain text!
    { id: '2', username: 'user', password: 'password', role: 'user' },
];

// Animation Variants
const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
};

// Helper Functions
const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

const TicketApp: React.FC = () => {
    // State
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [empresas] = useState<Empresa[]>(initialEmpresas);
    const [asesores] = useState<Asesor[]>(initialAsesores);
    const [clientes] = useState<Cliente[]>(initialClientes);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false); // State for register dialog
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [newTicket, setNewTicket] = useState<Ticket>({
        idTicket: '',
        tipoDeTicket: '',
        quienReporta: '',
        fecha: formatDate(new Date().toISOString().split('T')[0]),
        estatus: 'Abierto',
        asesorQueAtiende: '',
        empresa: '',
        descripcion: '', // Added description
    });
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false); // Track new ticket creation
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});  // State for form validation errors


    // Authentication
    const handleLogin = () => {
        setLoginError(null); // Reset error
        const user = users.find(u => u.username === loginUsername && u.password === loginPassword); //  Plain text password for demo
        if (user) {
            setCurrentUser(user);
            setIsLoginDialogOpen(false);
            setLoginUsername('');
            setLoginPassword('');
        } else {
            setLoginError('Credenciales inválidas. Por favor, verifica tu nombre de usuario y contraseña.');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleRegister = () => {
        setRegisterError(null);
        if (!registerUsername.trim() || !registerPassword.trim()) {
            setRegisterError("Por favor, ingresa nombre de usuario y contraseña.");
            return;
        }
        if (users.find(u => u.username === registerUsername)) {
            setRegisterError("El nombre de usuario ya existe.");
            return;
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            username: registerUsername,
            password: registerPassword, //  plain text password for demo
            role: 'user', // Default role
        };
        setUsers([...users, newUser]);
        setRegisterUsername('');
        setRegisterPassword('');
        setIsRegisterDialogOpen(false);
        setCurrentUser(newUser); // Log in the new user
    };

    // Ticket Management
    const validateTicketForm = (ticket: Ticket) => {
        const errors: { [key: string]: string } = {};

        if (!ticket.tipoDeTicket) {
            errors.tipoDeTicket = 'El tipo de ticket es requerido.';
        }
        if (!ticket.quienReporta) {
            errors.quienReporta = 'Quién reporta es requerido.';
        }
        if (!ticket.fecha) {
            errors.fecha = 'La fecha es requerida.';
        }
        if (!ticket.estatus) {
            errors.estatus = 'El estatus es requerido.';
        }
        if (!ticket.asesorQueAtiende) {
            errors.asesorQueAtiende = 'El asesor que atiende es requerido.';
        }
        if (!ticket.empresa) {
            errors.empresa = 'La empresa es requerida.';
        }
        if (!ticket.descripcion) { // Validate description
            errors.descripcion = 'La descripción es requerida.';
        }

        return errors;
    };

    const handleCreateTicket = () => {
        const errors = validateTicketForm(newTicket);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsCreatingTicket(true); // Set creating flag
        const ticketToAdd: Ticket = { ...newTicket, idTicket: crypto.randomUUID() };
        setTickets([...tickets, ticketToAdd]);
        setNewTicket({  // Reset form
            idTicket: '',
            tipoDeTicket: '',
            quienReporta: '',
            fecha: formatDate(new Date().toISOString().split('T')[0]),
            estatus: 'Abierto',
            asesorQueAtiende: '',
            empresa: '',
            descripcion: '',
        });
        setIsCreatingTicket(false); // Reset creating flag
    };

    const handleEditTicket = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setFormErrors({}); // Clear errors
    };

    const handleSaveTicket = () => {
        if (!editingTicket) return;
        const errors = validateTicketForm(editingTicket);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setTickets(tickets.map(t => t.idTicket === editingTicket.idTicket ? editingTicket : t));
        setEditingTicket(null);
    };

    const handleDeleteTicket = (idTicket: string) => {
        setTicketToDelete(idTicket);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteTicket = () => {
        if (ticketToDelete) {
            setTickets(tickets.filter(t => t.idTicket !== ticketToDelete));
        }
        setIsDeleteDialogOpen(false);
        setTicketToDelete(null);
    };

    const cancelDeleteTicket = () => {
        setIsDeleteDialogOpen(false);
        setTicketToDelete(null);
    };

    // Autorización
    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-md py-4">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Sistema de Tickets</h1>
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <>
                                <span className="text-gray-700 dark:text-gray-300">
                                    <UserPlus className="inline-block mr-1 w-4 h-4" />
                                    {currentUser.username}
                                </span>
                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsLoginDialogOpen(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Iniciar Sesión
                                </Button>
                                <Button
                                    onClick={() => setIsRegisterDialogOpen(true)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Registrarse
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {/* Conditional Rendering based on Authentication */}
                {!currentUser ? (
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Por favor, inicia sesión o regístrate para acceder al sistema de tickets.
                        </p>
                    </div>
                ) : (
                    <>
                        {isAdmin && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                    <Users className="mr-2 h-5 w-5" />
                                    Administrar Tickets
                                </h2>

                                {/* Create Ticket Section */}
                                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        Crear Nuevo Ticket
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Tipo de Ticket */}
                                        <div>
                                            <Label htmlFor="tipoDeTicket" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tipo de Ticket
                                            </Label>
                                            <Select
                                                onValueChange={(value) => setNewTicket({ ...newTicket, tipoDeTicket: value })}
                                                value={newTicket.tipoDeTicket}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Soporte">Soporte</SelectItem>
                                                    <SelectItem value="Incidencia">Incidencia</SelectItem>
                                                    <SelectItem value="Consulta">Consulta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formErrors.tipoDeTicket && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.tipoDeTicket}</p>
                                            )}
                                        </div>

                                        {/* Quién Reporta */}
                                        <div>
                                            <Label htmlFor="quienReporta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Quién Reporta
                                            </Label>
                                            <Select
                                                onValueChange={(value) => setNewTicket({ ...newTicket, quienReporta: value })}
                                                value={newTicket.quienReporta}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un cliente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientes.map(cliente => (
                                                        <SelectItem key={cliente.correo} value={cliente.nombre}>
                                                            {cliente.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.quienReporta && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.quienReporta}</p>
                                            )}
                                        </div>

                                        {/* Fecha */}
                                        <div>
                                            <Label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Fecha
                                            </Label>
                                            <Input
                                                type="date"
                                                id="fecha"
                                                value={newTicket.fecha}
                                                onChange={(e) => setNewTicket({ ...newTicket, fecha: formatDate(e.target.value) })}
                                                className="w-full"
                                            />
                                            {formErrors.fecha && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.fecha}</p>
                                            )}
                                        </div>

                                        {/* Estatus */}
                                        <div>
                                            <Label htmlFor="estatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Estatus
                                            </Label>
                                            <Select
                                                onValueChange={(value) => setNewTicket({ ...newTicket, estatus: value })}
                                                value={newTicket.estatus}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un estatus" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Abierto">Abierto</SelectItem>
                                                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                                                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formErrors.estatus && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.estatus}</p>
                                            )}
                                        </div>

                                        {/* Asesor que Atiende */}
                                        <div>
                                            <Label htmlFor="asesorQueAtiende" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Asesor que Atiende
                                            </Label>
                                            <Select
                                                onValueChange={(value) => setNewTicket({ ...newTicket, asesorQueAtiende: value })}
                                                value={newTicket.asesorQueAtiende}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un asesor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {asesores.map(asesor => (
                                                        <SelectItem key={asesor.numeroDeTrabajador} value={asesor.nombre}>
                                                            {asesor.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.asesorQueAtiende && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.asesorQueAtiende}</p>
                                            )}
                                        </div>

                                        {/* Empresa */}
                                        <div>
                                            <Label htmlFor="empresa" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Empresa
                                            </Label>
                                            <Select
                                                onValueChange={(value) => setNewTicket({ ...newTicket, empresa: value })}
                                                value={newTicket.empresa}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona una empresa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {empresas.map(empresa => (
                                                        <SelectItem key={empresa.nombre} value={empresa.nombre}>
                                                            {empresa.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.empresa && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.empresa}</p>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div className="col-span-full">
                                            <Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</Label>
                                            <Textarea
                                                id="descripcion"
                                                value={newTicket.descripcion}
                                                onChange={(e) => setNewTicket({ ...newTicket, descripcion: e.target.value })}
                                                rows={4}
                                                className="w-full"
                                                placeholder="Ingrese una descripción del problema..."
                                            />
                                            {formErrors.descripcion && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.descripcion}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            onClick={handleCreateTicket}
                                            disabled={isCreatingTicket}
                                            className={cn(
                                                "bg-green-500 hover:bg-green-600 text-white",
                                                isCreatingTicket && "opacity-70 cursor-not-allowed"
                                            )}
                                        >
                                            {isCreatingTicket ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creando...
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Crear Ticket
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Ticket List */}
                                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                                        <Briefcase className="mr-2 h-5 w-5" />
                                        Lista de Tickets
                                    </h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px] text-left text-gray-600 dark:text-gray-400">ID Ticket</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Tipo</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Quién Reporta</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Fecha</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Estatus</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Asesor</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Empresa</TableHead>
                                                    <TableHead className="text-left text-gray-600 dark:text-gray-400">Descripción</TableHead> {/* Added Description */}
                                                    <TableHead className="text-right text-gray-600 dark:text-gray-400">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {tickets.map((ticket) => (
editingTicket?.idTicket === ticket.idTicket ? (
                                                            <motion.tr
                                                                key={ticket.idTicket}
                                                                variants={listItemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                            >
                                                                <TableCell className="font-medium">{editingTicket.idTicket}</TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        onValueChange={(value) => setEditingTicket({ ...editingTicket, tipoDeTicket: value })}
                                                                        value={editingTicket.tipoDeTicket}
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecciona un tipo" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Soporte">Soporte</SelectItem>
                                                                            <SelectItem value="Incidencia">Incidencia</SelectItem>
                                                                            <SelectItem value="Consulta">Consulta</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {formErrors.tipoDeTicket && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.tipoDeTicket}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        onValueChange={(value) => setEditingTicket({ ...editingTicket, quienReporta: value })}
                                                                        value={editingTicket.quienReporta}
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecciona un cliente" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {clientes.map(cliente => (
                                                                                <SelectItem key={cliente.correo} value={cliente.nombre}>
                                                                                    {cliente.nombre}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {formErrors.quienReporta && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.quienReporta}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="date"
                                                                        value={editingTicket.fecha}
                                                                        onChange={(e) => setEditingTicket({ ...editingTicket, fecha: formatDate(e.target.value) })}
                                                                        className="w-full"
                                                                    />
                                                                    {formErrors.fecha && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.fecha}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        onValueChange={(value) => setEditingTicket({ ...editingTicket, estatus: value })}
                                                                        value={editingTicket.estatus}
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecciona un estatus" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Abierto">Abierto</SelectItem>
                                                                            <SelectItem value="En Proceso">En Proceso</SelectItem>
                                                                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {formErrors.estatus && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.estatus}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        onValueChange={(value) => setEditingTicket({ ...editingTicket, asesorQueAtiende: value })}
                                                                        value={editingTicket.asesorQueAtiende}
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecciona un asesor" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {asesores.map(asesor => (
                                                                                <SelectItem key={asesor.numeroDeTrabajador} value={asesor.nombre}>
                                                                                    {asesor.nombre}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {formErrors.asesorQueAtiende && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.asesorQueAtiende}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        onValueChange={(value) => setEditingTicket({ ...editingTicket, empresa: value })}
                                                                        value={editingTicket.empresa}
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecciona una empresa" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {empresas.map(empresa => (
                                                                                <SelectItem key={empresa.nombre} value={empresa.nombre}>
                                                                                    {empresa.nombre}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {formErrors.empresa && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.empresa}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Textarea
                                                                        value={editingTicket.descripcion}
                                                                        onChange={(e) => setEditingTicket({ ...editingTicket, descripcion: e.target.value })}
                                                                        rows={4}
                                                                        className="w-full"
                                                                        placeholder="Ingrese una descripción del problema..."
                                                                    />
                                                                    {formErrors.descripcion && (
                                                                        <p className="mt-1 text-sm text-red-500">{formErrors.descripcion}</p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        onClick={handleSaveTicket}
                                                                        className="bg-green-500 hover:bg-green-600 text-white mr-2"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => setEditingTicket(null)}
                                                                        className="bg-gray-500 hover:bg-gray-600 text-white"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </motion.tr>
                                                        ) : (
                                                            <motion.tr
                                                                key={ticket.idTicket}
                                                                variants={listItemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                            >
                                                                <TableCell className="font-medium text-gray-900 dark:text-white">{ticket.idTicket}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.tipoDeTicket}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.quienReporta}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{formatDate(ticket.fecha)}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.estatus}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.asesorQueAtiende}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.empresa}</TableCell>
                                                                <TableCell className="text-gray-700 dark:text-gray-300">{ticket.descripcion}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        onClick={() => handleEditTicket(ticket)}
                                                                        className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => handleDeleteTicket(ticket.idTicket)}
                                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </motion.tr>
                                                        )
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Eliminar Ticket</DialogTitle>
                                    <DialogDescription>
                                        ¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="destructive" onClick={confirmDeleteTicket} className="bg-red-500 hover:bg-red-600 text-white">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                    <Button variant="secondary" onClick={cancelDeleteTicket} className="bg-gray-500 hover:bg-gray-600 text-white">
                                        Cancelar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Login Dialog */}
                        <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Iniciar Sesión</DialogTitle>
                                    <DialogDescription>
                                        Inicia sesión para acceder al sistema de tickets.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="username" className="text-right">
                                            Usuario
                                        </Label>
                                        <Input
                                            id="username"
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">
                                            Contraseña
                                        </Label>
                                        <Input
                                            type="password"
                                            id="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {loginError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{loginError}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleLogin}
                                        className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Register Dialog */}
                        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Registrarse</DialogTitle>
                                    <DialogDescription>
                                        Regístrate para crear una cuenta y acceder al sistema de tickets.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="register-username" className="text-right">
                                            Usuario
                                        </Label>
                                        <Input
                                            id="register-username"
                                            value={registerUsername}
                                            onChange={(e) => setRegisterUsername(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="register-password" className="text-right">
                                            Contraseña
                                        </Label>
                                        <Input
                                            type="password"
                                            id="register-password"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    {registerError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{registerError}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleRegister}
                                        className="bg-green-500 hover:bg-green-600 text-white w-full"
                                    >
                                        Registrarse
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
};

export default TicketApp;
