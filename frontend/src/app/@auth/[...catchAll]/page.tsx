// Soft navigation anywhere else (e.g. /dashboard after logging in) must clear
// the slot, otherwise the modal would stay mounted over the next page.
export default function AuthSlotCatchAll() {
  return null;
}
