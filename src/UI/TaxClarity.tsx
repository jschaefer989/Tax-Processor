import { useCallback } from "react";
import useAuthentication from "../hooks/useAuthentication";
import useServerBehavior from "../hooks/useServerBehavior";
import { useTaxBehavior } from "../hooks/useTaxBehavior";
import AuthPage from "./Auth/AuthPage";
import ServerDown from "./General/ServerDown";
import MainApp from "./MainApp";
import PageWrapper from "./PageWrapper";
import StartPage from "./StartPage/StartPage";

export default function TaxClarity() {
  const { serverBehavior, isServerDown, isInitialized } = useServerBehavior();

  const {
    taxBehavior,
    currentStep,
    responses,
    isLoading,
    lastSavedTime,
    toastMessage,
    year,
    name,
    noDbConnection,
    showStartPage,
    panelExpanded,
    sidebarExpanded,
    contextMenu,
    onWhitespaceClick,
    duplicateResponses,
    advancedWithErrors,
  } = useTaxBehavior({ serverBehavior });

  const { isAuthenticated, setIsAuthenticated } = useAuthentication({
    serverBehavior,
  });

  const onAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  const pageWrapperProps = {
    toastMessage,
    contextMenu,
    duplicateResponses,
    taxBehavior,
    onWhitespaceClick,
  };

  if (!isInitialized) {
    return <PageWrapper {...pageWrapperProps} />;
  }

  if (isServerDown) {
    return (
      <PageWrapper {...pageWrapperProps}>
        <ServerDown />
      </PageWrapper>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageWrapper {...pageWrapperProps}>
        <AuthPage
          serverBehavior={serverBehavior}
          onAuthenticated={onAuthenticated}
          isBusy={isLoading}
          setIsBusy={taxBehavior.state.setIsLoading}
        />
      </PageWrapper>
    );
  }

  if (showStartPage) {
    return (
      <PageWrapper {...pageWrapperProps}>
        <StartPage
          taxBehavior={taxBehavior}
          selectedYear={year}
          selectedName={name}
          isLoading={isLoading}
          noDbConnection={noDbConnection}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper {...pageWrapperProps}>
      <MainApp
        currentStep={currentStep}
        isLoading={isLoading}
        taxBehavior={taxBehavior}
        responses={responses}
        lastSavedTime={lastSavedTime}
        year={year}
        name={name}
        noDbConnection={noDbConnection}
        panelExpanded={panelExpanded}
        sidebarExpanded={sidebarExpanded}
        advancedWithErrors={advancedWithErrors}
      />
    </PageWrapper>
  );
}
