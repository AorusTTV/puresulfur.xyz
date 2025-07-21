
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SitePoliciesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Site Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-foreground">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  puresulfur.xyz is not affiliated, endorsed by, or in any way associated with the Rust game, 
                  Facepunch Studios, Steam, Valve Corporation, or any of their subsidiaries or affiliates.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  All graphics, game assets, sounds, and brands are property of their respective owners. 
                  All company, product, and service names used on this website are for identification purposes only. 
                  Use of these names, logos, and brands does not imply endorsement.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Responsible Use & Age Requirement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This site is intended for users aged 18 years or older (or the legal age for online wagering in 
                  YOUR‑JURISDICTION, whichever is higher). By accessing or using the services you confirm that you 
                  meet this requirement and that participation is lawful in your location. We reserve the right to 
                  request proof of age and to suspend or close any account that fails verification.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">No Warranty</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All services, content, and software on puresulfur.xyz are provided "as is" and "as available" 
                  without warranties of any kind—express, implied, or statutory—including, but not limited to, any 
                  implied warranties of merchantability, fitness for a particular purpose, non‑infringement, or 
                  uninterrupted availability. We do not guarantee that the site will be error‑free, secure, or free 
                  from viruses or other harmful components.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Assumption of Risk</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You understand and accept that all wagering and item‑trading activities involve financial risk, 
                  and you agree to bear that risk in full. Historical performance or displayed probabilities do not 
                  guarantee future outcomes. Always wager responsibly and never stake more than you can afford to lose.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">No Refund / No Charge‑Back</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All deposits, purchases, and wagers on puresulfur.xyz are <strong className="text-destructive">final and non‑refundable</strong>. 
                  By completing a transaction you waive any right to reverse, charge back, or otherwise dispute the 
                  payment with your bank, card issuer, payment processor, or third‑party service. Attempted charge‑backs 
                  will be treated as fraudulent and may result in immediate account suspension, loss of balances or items, 
                  and reporting to relevant authorities and credit bureaus.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Account Suspension & Ban Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right, at our sole discretion, to temporarily or permanently suspend or terminate any 
                  account that engages in, or attempts to engage in, cheating, bug‑abusing, exploiting, scripting, 
                  botting, fraud, harassment, charge‑back abuse, or any other activity that undermines the integrity, 
                  security, or fair play of puresulfur.xyz. Balances, items, and wagers associated with banned accounts 
                  may be seized or voided without compensation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Copyright & Intellectual Property Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Except where otherwise noted, all original code, text, graphics, logos, audio, and other content on 
                  puresulfur.xyz are the intellectual property of puresulfur.xyz or its licensors and are 
                  protected by international copyright and related laws. Unauthorized reproduction, distribution, 
                  modification, or public display of any content is strictly prohibited.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  <strong>DMCA / Notice‑and‑Takedown:</strong> If you believe that material hosted on puresulfur.xyz 
                  infringes your copyright, please email a detailed notice to <strong className="text-primary">copyright@puresulfur.xyz</strong> containing 
                  all information required under 17 U.S.C. §512 (or applicable local law). We will promptly investigate 
                  and, where appropriate, remove or disable access to the alleged infringing material.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, puresulfur.xyz, PureSulfur, its affiliates, 
                  officers, employees, agents, or suppliers shall not be liable for any indirect, incidental, consequential, 
                  special, punitive, or exemplary damages, nor for any loss of profits, data, goodwill, or other intangible 
                  losses, arising out of or in connection with your use (or inability to use) the site—even if we have been 
                  advised of the possibility of such damages. Our total aggregate liability for any and all claims shall not 
                  exceed the greater of (a) the amount you paid us in the preceding ninety (90) days or (b) USD 100 
                  (one hundred US dollars).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">Governing Law & Venue</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by, and construed in accordance with, the laws of Puresulfur.xyz System 
                  (without regard to conflict‑of‑law principles). You agree that any dispute or claim not subject to 
                  binding arbitration shall be resolved exclusively in the courts located in Spain - Villadecans, and you hereby 
                  submit to their personal jurisdiction.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Last updated: 28 Jun 2025.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SitePoliciesPage;
