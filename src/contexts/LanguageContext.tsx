import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.caregiver': 'Caregiver',
    'nav.child': 'Child Mode',
    'nav.signOut': 'Sign Out',

    // Caregiver Dashboard
    'caregiver.title': 'Caregiver Dashboard',
    'caregiver.subtitle': 'Create and manage learning routines for your child',
    'caregiver.newRoutine': 'New Routine',
    'caregiver.myRoutines': 'My Routines',
    'caregiver.noRoutines': 'No routines yet. Create your first routine!',
    'caregiver.createRoutine': 'Create Routine',
    'caregiver.viewRoutine': 'View Routine',
    'caregiver.schedule': 'Schedule',
    'caregiver.steps': 'steps',
    'caregiver.custom': 'Custom',
    'caregiver.deleteTitle': 'Delete Routine?',
    'caregiver.deleteDesc': 'This action cannot be undone. This will permanently delete the routine and all its flashcards.',
    'caregiver.cancel': 'Cancel',
    'caregiver.delete': 'Delete',

    // Child Mode
    'child.loading': 'Loading your routines...',
    'child.noRoutines': 'No Routines Today',
    'child.noRoutinesDesc': 'There are no scheduled routines for this time. Check back later!',
    'child.step': 'Step',
    'child.of': 'of',
    'child.readToMe': 'Read to Me',
    'child.watchVideo': 'Watch Video',
    'child.previous': 'Previous',
    'child.next': 'Next',

    // Routine Detail
    'routine.backToDashboard': 'Back to Dashboard',
    'routine.watchVideo': 'Watch Video',
    'routine.addSchedule': 'Add Schedule',
    'routine.editSchedule': 'Edit Schedule',
    'routine.noSteps': 'No steps added yet',
    'routine.stepOf': 'Step {current} of {total}',
    'routine.readAloud': 'Read Aloud',
    'routine.scheduleRoutine': 'Schedule Routine',
    'routine.scheduleDesc': 'Set when this routine should appear in child mode',
    'routine.time': 'Time',
    'routine.daysOfWeek': 'Days of Week',
    'routine.saveSchedule': 'Save Schedule',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.caregiver': 'Cuidador',
    'nav.child': 'Modo Niño',
    'nav.signOut': 'Cerrar Sesión',

    // Caregiver Dashboard
    'caregiver.title': 'Panel del Cuidador',
    'caregiver.subtitle': 'Crear y gestionar rutinas de aprendizaje para su hijo',
    'caregiver.newRoutine': 'Nueva Rutina',
    'caregiver.myRoutines': 'Mis Rutinas',
    'caregiver.noRoutines': '¡Aún no hay rutinas. Crea tu primera rutina!',
    'caregiver.createRoutine': 'Crear Rutina',
    'caregiver.viewRoutine': 'Ver Rutina',
    'caregiver.schedule': 'Programar',
    'caregiver.steps': 'pasos',
    'caregiver.custom': 'Personalizado',
    'caregiver.deleteTitle': '¿Eliminar Rutina?',
    'caregiver.deleteDesc': 'Esta acción no se puede deshacer. Esto eliminará permanentemente la rutina y todas sus tarjetas.',
    'caregiver.cancel': 'Cancelar',
    'caregiver.delete': 'Eliminar',

    // Child Mode
    'child.loading': 'Cargando tus rutinas...',
    'child.noRoutines': 'No hay Rutinas Hoy',
    'child.noRoutinesDesc': 'No hay rutinas programadas para este momento. ¡Vuelve más tarde!',
    'child.step': 'Paso',
    'child.of': 'de',
    'child.readToMe': 'Léeme',
    'child.watchVideo': 'Ver Video',
    'child.previous': 'Anterior',
    'child.next': 'Siguiente',

    // Routine Detail
    'routine.backToDashboard': 'Volver al Panel',
    'routine.watchVideo': 'Ver Video',
    'routine.addSchedule': 'Agregar Horario',
    'routine.editSchedule': 'Editar Horario',
    'routine.noSteps': 'Aún no se han agregado pasos',
    'routine.stepOf': 'Paso {current} de {total}',
    'routine.readAloud': 'Leer en Voz Alta',
    'routine.scheduleRoutine': 'Programar Rutina',
    'routine.scheduleDesc': 'Establecer cuándo debe aparecer esta rutina en modo niño',
    'routine.time': 'Hora',
    'routine.daysOfWeek': 'Días de la Semana',
    'routine.saveSchedule': 'Guardar Horario',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.caregiver': 'Soignant',
    'nav.child': 'Mode Enfant',
    'nav.signOut': 'Se Déconnecter',

    // Caregiver Dashboard
    'caregiver.title': 'Tableau de Bord du Soignant',
    'caregiver.subtitle': 'Créer et gérer des routines d\'apprentissage pour votre enfant',
    'caregiver.newRoutine': 'Nouvelle Routine',
    'caregiver.myRoutines': 'Mes Routines',
    'caregiver.noRoutines': 'Pas encore de routines. Créez votre première routine!',
    'caregiver.createRoutine': 'Créer une Routine',
    'caregiver.viewRoutine': 'Voir la Routine',
    'caregiver.schedule': 'Planifier',
    'caregiver.steps': 'étapes',
    'caregiver.custom': 'Personnalisé',
    'caregiver.deleteTitle': 'Supprimer la Routine?',
    'caregiver.deleteDesc': 'Cette action ne peut pas être annulée. Cela supprimera définitivement la routine et toutes ses cartes.',
    'caregiver.cancel': 'Annuler',
    'caregiver.delete': 'Supprimer',

    // Child Mode
    'child.loading': 'Chargement de vos routines...',
    'child.noRoutines': 'Pas de Routines Aujourd\'hui',
    'child.noRoutinesDesc': 'Il n\'y a pas de routines programmées pour ce moment. Revenez plus tard!',
    'child.step': 'Étape',
    'child.of': 'de',
    'child.readToMe': 'Lis-moi',
    'child.watchVideo': 'Regarder la Vidéo',
    'child.previous': 'Précédent',
    'child.next': 'Suivant',

    // Routine Detail
    'routine.backToDashboard': 'Retour au Tableau de Bord',
    'routine.watchVideo': 'Regarder la Vidéo',
    'routine.addSchedule': 'Ajouter un Horaire',
    'routine.editSchedule': 'Modifier l\'Horaire',
    'routine.noSteps': 'Aucune étape ajoutée pour le moment',
    'routine.stepOf': 'Étape {current} de {total}',
    'routine.readAloud': 'Lire à Haute Voix',
    'routine.scheduleRoutine': 'Planifier la Routine',
    'routine.scheduleDesc': 'Définir quand cette routine doit apparaître en mode enfant',
    'routine.time': 'Heure',
    'routine.daysOfWeek': 'Jours de la Semaine',
    'routine.saveSchedule': 'Enregistrer l\'Horaire',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.caregiver': 'Betreuer',
    'nav.child': 'Kindermodus',
    'nav.signOut': 'Abmelden',

    // Caregiver Dashboard
    'caregiver.title': 'Betreuer-Dashboard',
    'caregiver.subtitle': 'Lernroutinen für Ihr Kind erstellen und verwalten',
    'caregiver.newRoutine': 'Neue Routine',
    'caregiver.myRoutines': 'Meine Routinen',
    'caregiver.noRoutines': 'Noch keine Routinen. Erstellen Sie Ihre erste Routine!',
    'caregiver.createRoutine': 'Routine Erstellen',
    'caregiver.viewRoutine': 'Routine Anzeigen',
    'caregiver.schedule': 'Planen',
    'caregiver.steps': 'Schritte',
    'caregiver.custom': 'Benutzerdefiniert',
    'caregiver.deleteTitle': 'Routine Löschen?',
    'caregiver.deleteDesc': 'Diese Aktion kann nicht rückgängig gemacht werden. Dies wird die Routine und alle ihre Karten dauerhaft löschen.',
    'caregiver.cancel': 'Abbrechen',
    'caregiver.delete': 'Löschen',

    // Child Mode
    'child.loading': 'Ihre Routinen werden geladen...',
    'child.noRoutines': 'Keine Routinen Heute',
    'child.noRoutinesDesc': 'Für diese Zeit sind keine Routinen geplant. Schauen Sie später noch einmal vorbei!',
    'child.step': 'Schritt',
    'child.of': 'von',
    'child.readToMe': 'Lies mir vor',
    'child.watchVideo': 'Video Ansehen',
    'child.previous': 'Zurück',
    'child.next': 'Weiter',

    // Routine Detail
    'routine.backToDashboard': 'Zurück zum Dashboard',
    'routine.watchVideo': 'Video Ansehen',
    'routine.addSchedule': 'Zeitplan Hinzufügen',
    'routine.editSchedule': 'Zeitplan Bearbeiten',
    'routine.noSteps': 'Noch keine Schritte hinzugefügt',
    'routine.stepOf': 'Schritt {current} von {total}',
    'routine.readAloud': 'Laut Vorlesen',
    'routine.scheduleRoutine': 'Routine Planen',
    'routine.scheduleDesc': 'Festlegen, wann diese Routine im Kindermodus erscheinen soll',
    'routine.time': 'Zeit',
    'routine.daysOfWeek': 'Wochentage',
    'routine.saveSchedule': 'Zeitplan Speichern',

    // Common
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.save': 'Speichern',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.caregiver': 'देखभालकर्ता',
    'nav.child': 'बच्चे का मोड',
    'nav.signOut': 'साइन आउट',

    // Caregiver Dashboard
    'caregiver.title': 'देखभालकर्ता डैशबोर्ड',
    'caregiver.subtitle': 'अपने बच्चे के लिए सीखने की दिनचर्या बनाएं और प्रबंधित करें',
    'caregiver.newRoutine': 'नई दिनचर्या',
    'caregiver.myRoutines': 'मेरी दिनचर्या',
    'caregiver.noRoutines': 'अभी तक कोई दिनचर्या नहीं। अपनी पहली दिनचर्या बनाएं!',
    'caregiver.createRoutine': 'दिनचर्या बनाएं',
    'caregiver.viewRoutine': 'दिनचर्या देखें',
    'caregiver.schedule': 'शेड्यूल',
    'caregiver.steps': 'कदम',
    'caregiver.custom': 'कस्टम',
    'caregiver.deleteTitle': 'दिनचर्या हटाएं?',
    'caregiver.deleteDesc': 'यह क्रिया पूर्ववत नहीं की जा सकती। यह दिनचर्या और इसके सभी फ्लैशकार्ड को स्थायी रूप से हटा देगा।',
    'caregiver.cancel': 'रद्द करें',
    'caregiver.delete': 'हटाएं',

    // Child Mode
    'child.loading': 'आपकी दिनचर्या लोड हो रही है...',
    'child.noRoutines': 'आज कोई दिनचर्या नहीं',
    'child.noRoutinesDesc': 'इस समय के लिए कोई शेड्यूल दिनचर्या नहीं है। बाद में वापस जांचें!',
    'child.step': 'कदम',
    'child.of': 'का',
    'child.readToMe': 'मुझे पढ़ें',
    'child.watchVideo': 'वीडियो देखें',
    'child.previous': 'पिछला',
    'child.next': 'अगला',

    // Routine Detail
    'routine.backToDashboard': 'डैशबोर्ड पर वापस जाएं',
    'routine.watchVideo': 'वीडियो देखें',
    'routine.addSchedule': 'शेड्यूल जोड़ें',
    'routine.editSchedule': 'शेड्यूल संपादित करें',
    'routine.noSteps': 'अभी तक कोई कदम नहीं जोड़ा गया',
    'routine.stepOf': 'कदम {current} का {total}',
    'routine.readAloud': 'जोर से पढ़ें',
    'routine.scheduleRoutine': 'दिनचर्या शेड्यूल करें',
    'routine.scheduleDesc': 'सेट करें कि यह दिनचर्या बच्चे के मोड में कब दिखाई देनी चाहिए',
    'routine.time': 'समय',
    'routine.daysOfWeek': 'सप्ताह के दिन',
    'routine.saveSchedule': 'शेड्यूल सहेजें',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.save': 'सहेजें',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
