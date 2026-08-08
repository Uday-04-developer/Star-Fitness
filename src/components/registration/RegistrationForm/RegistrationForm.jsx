import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import PlanSelector from '@/components/registration/PlanSelector/PlanSelector';
import SelfieCapture from '@/components/registration/SelfieCapture/SelfieCapture';
import { useMemberForm } from '@/hooks/useMemberForm';
import { formatDisplayDate, getNearTermDateRange } from '@/utils/date';
import styles from './RegistrationForm.module.css';

const RegistrationForm = ({ onSuccess }) => {
  const dateRange = getNearTermDateRange();
  const dateHelper = `Selectable: ${formatDisplayDate(dateRange.min)} – ${formatDisplayDate(dateRange.max)}.`;
  const {
    values,
    errors,
    selfiePreviewUrl,
    submitError,
    isSubmitting,
    setField,
    setSelfie,
    submit,
  } = useMemberForm({
    onMemberCreated: (member, warning) => {
      onSuccess?.(member, warning);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setField(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className={styles.banner} role="alert">
          {submitError}
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="personal-heading">
        <h2 id="personal-heading" className={styles.sectionTitle}>
          Personal info
        </h2>
        <p className={styles.sectionCopy}>
          Quick details so we can set up your membership.
        </p>

        <div className={styles.fields}>
          <Input
            label="Full name"
            name="full_name"
            value={values.full_name}
            onChange={handleChange}
            error={errors.full_name}
            placeholder="Your full name"
            required
          />
          <Input
            label="Phone number"
            name="phone_number"
            type="tel"
            value={values.phone_number}
            onChange={handleChange}
            error={errors.phone_number}
            placeholder="10-digit mobile number"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Optional"
          />
          <div className={styles.row}>
            <div className={styles.selectField}>
              <label className={styles.selectLabel} htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className={styles.select}
                value={values.gender}
                onChange={handleChange}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <DatePicker
              label="Date of birth"
              name="date_of_birth"
              value={values.date_of_birth}
              onChange={handleChange}
              min={dateRange.min}
              max={dateRange.max}
              helperText={dateHelper}
            />
          </div>
          <Input
            label="Address"
            name="address"
            value={values.address}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="plan-heading">
        <h2 id="plan-heading" className={styles.sectionTitle}>
          Choose your plan
        </h2>
        <p className={styles.sectionCopy}>
          Pick a membership length. Prices shown are typical references.
        </p>
        <PlanSelector
          selectedPlan={values.plan_type}
          onChange={(planType) => setField('plan_type', planType)}
          error={errors.plan_type}
        />
        <div className={styles.amountField}>
          <Input
            label="Amount paid (optional)"
            name="plan_amount"
            type="number"
            value={values.plan_amount}
            onChange={handleChange}
            placeholder="e.g. 1500"
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="selfie-heading">
        <h2 id="selfie-heading" className={styles.sectionTitle}>
          Selfie <span className={styles.requiredMark}>*</span>
        </h2>
        <p className={styles.sectionCopy}>
          Required — turn on your camera, then capture a clear face photo for
          your member ID.
        </p>
        <SelfieCapture
          existingImage={selfiePreviewUrl}
          onCapture={setSelfie}
          error={errors.selfie}
        />
      </section>

      <div className={styles.submit}>
        <Button
          type="submit"
          label="Complete Registration"
          fullWidth
          isLoading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default RegistrationForm;
