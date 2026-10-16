import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, DollarSign, Tag, FileText, Check, AlertCircle } from 'lucide-react';
import { Lead, KanbanStage } from '../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  stages: KanbanStage[];
  initialStageId?: string;
  leadToEdit?: Lead | null;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stages,
  initialStageId,
  leadToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stageId, setStageId] = useState('stage-1');
  const [value, setValue] = useState('2500');
  const [interest, setInterest] = useState('');
  const [tagsInput, setTagsInput] = useState('WhatsApp, Quente');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (leadToEdit) {
        setName(leadToEdit.name || '');
        setPhone(leadToEdit.phone || '');
        setEmail(leadToEdit.email || '');
        setStageId(leadToEdit.stageId || initialStageId || stages[0]?.id || 'stage-1');
        setValue(String(typeof leadToEdit.value === 'number' ? leadToEdit.value : 0));
        setInterest(leadToEdit.interest || '');
        setTagsInput(Array.isArray(leadToEdit.tags) ? leadToEdit.tags.join(', ') : 'WhatsApp, Quente');
        setNotes(leadToEdit.notes || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setStageId(initialStageId || stages[0]?.id || 'stage-1');
        setValue('2500');
        setInterest('');
        setTagsInput('WhatsApp, Quente');
        setNotes('');
      }
    }
  }, [isOpen, leadToEdit, initialStageId, stages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanEmail = email.trim();
    const parsedValue = Math.max(0, parseFloat(value) || 0);

    if (!cleanName) {
      setFormError('Por favor, informe o nome do lead ou empresa.');
      return;
    }

    if (cleanPhone.length < 8) {
      setFormError('Informe um número de WhatsApp válido (com DDD, apenas números).');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('O formato do e-mail informado é inválido.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      stageId,
      value: parsedValue,
      interest: interest.trim(),
      tags,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      id="modal-lead-backdrop"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>{leadToEdit ? 'Editar Oportunidade' : 'Nova Oportunidade / Lead'}</span>
          </div>
          <button
            id="btn-close-lead-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {formError && (
            <div className="bg-rose-950/60 border border-rose-500/50 text-rose-200 rounded-lg px-3.5 py-2.5 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Lead / Empresa *
              </label>
              <input
                id="lead-input-name"
                type="text"
                required
                placeholder="Ex: Dra. Mariana Rios"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp (apenas números) *
              </label>
              <div className="relative">
                <input
                  id="lead-input-phone"
                  type="text"
                  required
                  placeholder="5511999998888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail (opcional)
              </label>
              <input
                id="lead-input-email"
                type="email"
                placeholder="contato@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estágio no Funil Kanban
              </label>
              <select
                id="lead-select-stage"
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor Estimado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                  R$
                </span>
                <input
                  id="lead-input-value"
                  type="number"
                  step="100"
                  placeholder="2500"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                id="lead-input-tags"
                type="text"
                placeholder="Ex: SaaS, Decisor, Alta Prioridade"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interesse / Produto Solicitado
            </label>
            <input
              id="lead-input-interest"
              type="text"
              placeholder="Ex: NEXA CRM Enterprise com 5 números de WhatsApp"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas & Observações Internas
            </label>
            <textarea
              id="lead-input-notes"
              rows={3}
              placeholder="Histórico ou detalhes identificados durante a qualificação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-lead"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-lead"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{leadToEdit ? 'Salvar Alterações' : 'Criar Oportunidade'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
