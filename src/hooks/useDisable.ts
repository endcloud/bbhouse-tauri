export const useDisable = () => {
    document.addEventListener('contextmenu', event => event.preventDefault());
}