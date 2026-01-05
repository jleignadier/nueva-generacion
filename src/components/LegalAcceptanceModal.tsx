import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface LegalDocument {
  document_type: 'terms_and_privacy' | 'volunteering_rules';
  file_url: string;
  version: number;
}

export const LegalAcceptanceModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkAcceptance();
    }
  }, [user]);

  const checkAcceptance = async () => {
    if (!user) return;

    const { data: hasAccepted } = await supabase.rpc('has_accepted_legal_docs', {
      p_user_id: user.id,
    });

    if (hasAccepted === false) {
      // User needs to accept documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('document_type, file_url, version')
        .eq('is_current', true)
        .in('document_type', ['terms_and_privacy', 'volunteering_rules']);

      if (docs && docs.length > 0) {
        setDocuments(docs as LegalDocument[]);
        setOpen(true);
      }
    }
  };

  const handleAccept = async () => {
    if (!user) return;

    const allAccepted = documents.every(doc => accepted[doc.document_type]);
    if (!allAccepted) {
      toast({
        title: "Error",
        description: "Debes aceptar todos los documentos para continuar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert acceptance records for all documents
      const acceptanceRecords = documents.map(doc => ({
        user_id: user.id,
        document_type: doc.document_type,
        version_accepted: doc.version,
      }));

      const { error } = await supabase
        .from('user_legal_acceptance')
        .upsert(acceptanceRecords, {
          onConflict: 'user_id,document_type,version_accepted',
          ignoreDuplicates: true
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documentos aceptados correctamente",
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar aceptación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'terms_and_privacy':
        return 'Términos, Condiciones y Privacidad';
      case 'volunteering_rules':
        return 'Reglamento de Voluntariado';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Documentos Legales - Aceptación Requerida</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Para continuar usando la plataforma, debes leer y aceptar los siguientes documentos:
            </p>

            {documents.map((doc) => (
              <div key={doc.document_type} className="space-y-3 border p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={doc.document_type}
                    checked={accepted[doc.document_type] || false}
                    onCheckedChange={(checked) =>
                      setAccepted(prev => ({ ...prev, [doc.document_type]: !!checked }))
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={doc.document_type}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      He leído y acepto {getDocumentLabel(doc.document_type)} (v{doc.version})
                    </label>
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-1 text-primary hover:text-primary/80"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      Ver documento completo
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleAccept}
            disabled={loading || documents.some(doc => !accepted[doc.document_type])}
          >
            {loading ? 'Guardando...' : 'Aceptar y Continuar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
