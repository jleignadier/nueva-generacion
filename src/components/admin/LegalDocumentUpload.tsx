import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, validateFileType } from "@/utils/fileUpload";
import { Download, Upload, FileText } from "lucide-react";

interface LegalDocumentUploadProps {
  documentType: 'terms_of_service' | 'privacy_policy' | 'volunteering_rules';
  label: string;
}

export const LegalDocumentUpload = ({ documentType, label }: LegalDocumentUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<{
    version: number;
    file_url: string;
    uploaded_at: string;
  } | null>(null);

  useEffect(() => {
    fetchCurrentDocument();
  }, [documentType]);

  const fetchCurrentDocument = async () => {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('version, file_url, uploaded_at')
      .eq('document_type', documentType)
      .eq('is_current', true)
      .single();

    if (!error && data) {
      setCurrentDoc(data);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file, ['application/pdf'])) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const { url } = await uploadFile('legal-documents', file);

      // Get next version number
      const { data: maxVersion } = await supabase
        .from('legal_documents')
        .select('version')
        .eq('document_type', documentType)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (maxVersion?.version || 0) + 1;

      // Mark all previous versions as not current
      await supabase
        .from('legal_documents')
        .update({ is_current: false })
        .eq('document_type', documentType);

      // Insert new document version
      const { error: insertError } = await supabase
        .from('legal_documents')
        .insert({
          document_type: documentType,
          file_url: url,
          version: nextVersion,
          is_current: true,
        });

      if (insertError) throw insertError;

      toast({
        title: "Éxito",
        description: `${label} v${nextVersion} subido correctamente`,
      });

      fetchCurrentDocument();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir el documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      
      {currentDoc && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Versión {currentDoc.version}</p>
              <p className="text-xs text-muted-foreground">
                Subido: {new Date(currentDoc.uploaded_at).toLocaleDateString('es-PA')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(currentDoc.file_url, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Ver PDF
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="flex-1"
        />
        <Button disabled={uploading} size="sm" variant="secondary">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Subiendo...' : 'Subir Nueva Versión'}
        </Button>
      </div>
    </div>
  );
};
