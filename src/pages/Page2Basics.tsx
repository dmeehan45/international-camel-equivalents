import type { DowryForm } from '../domain/types';
import type { uxCopy } from '../content/uxCopy';

type Props = {
  copy: typeof uxCopy;
  form: DowryForm;
  regions: string[];
  ageRanges: string[];
  optionalOpen: boolean;
  onToggleOptional: () => void;
  onSetField: (field: keyof DowryForm, value: string) => void;
  onContinue: () => void;
};

export function Page2Basics({ copy, form, regions, ageRanges, optionalOpen, onToggleOptional, onSetField, onContinue }: Props) {
  return (
    <div>
      <h2>{copy.page2.title}</h2>
      <label>{copy.page2.nameLabel}
        <input value={form.bidName} placeholder={copy.page2.namePlaceholder} onChange={(e) => onSetField('bidName', e.target.value)} />
      </label>
      <label>{copy.page2.regionLabel}
        <select value={form.bidRegion} onChange={(e) => onSetField('bidRegion', e.target.value)}>
          <option value="">{copy.page2.regionPlaceholder}</option>
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </label>

      <button className="cta-secondary text-link" onClick={onToggleOptional}>{optionalOpen ? copy.page2.hideMore : copy.page2.addMore}</button>
      {optionalOpen && (
        <div className="drawer">
          <label>{copy.page2.ageRange}
            <select value={form.ageRange} onChange={(e) => onSetField('ageRange', e.target.value)}>
              <option value="">Select age range</option>
              {ageRanges.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>{copy.page2.occupation}
            <input value={form.occupation} placeholder={copy.page2.occupationPlaceholder} onChange={(e) => onSetField('occupation', e.target.value)} />
          </label>
          <label>{copy.page2.quirkyFact}
            <input value={form.quirkyFact} placeholder={copy.page2.quirkyFactPlaceholder} onChange={(e) => onSetField('quirkyFact', e.target.value)} />
          </label>
        </div>
      )}

      <button className="ccc-button-primary" onClick={onContinue}>{copy.page2.continue}</button>
    </div>
  );
}
