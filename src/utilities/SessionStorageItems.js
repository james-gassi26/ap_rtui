export const redirectTo = JSON.parse(JSON.stringify(sessionStorage.getItem('redirectTo')));
export const reloadCounter = JSON.parse(sessionStorage.getItem('reloadCounter'));
export const sessSelectedBranchID = () => {
    const selectedBranch = JSON.parse(sessionStorage.getItem('selectedBranchID'));

    //check first if selectedBranchID key is existing in session storage
    if(selectedBranch) {
        return selectedBranch;
    } else {
        //if not yet existing, create selectedBranchID key.
        sessionStorage.setItem("selectedBranchID", 0);
        return 0
    }
};