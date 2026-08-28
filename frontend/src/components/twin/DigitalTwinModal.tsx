import React, { useState } from "react";
import { useDigitalTwin, TwinProfile, PersonaType } from "@/context/DigitalTwinContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Sparkles,
  Sliders,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Scale,
  Award,
} from "lucide-react";
import { toast } from "sonner";

const STORES = ["Amazon", "Flipkart", "Meesho", "Myntra", "Blinkit"];
const CATEGORIES = ["Tech & Electronics", "Fashion", "Home & Lifestyle", "Gaming"];

const PERSONAS: { type: PersonaType; title: string; desc: string; icon: React.ElementType }[] = [
  { type: "value_seeker", title: "Value Seeker", desc: "Best balance of performance, rating & reasonable price", icon: Scale },
  { type: "tech_enthusiast", title: "Tech Enthusiast", desc: "Wants cutting-edge specs and high quality, flexible budget", icon: Zap },
  { type: "budget_conscious", title: "Budget Conscious", desc: "Strict price focus, waits for high price drops & low deals", icon: TrendingDown },
  { type: "premium_luxury", title: "Premium Luxury", desc: "Prioritizes top brand reputation, zero defect risk & premium service", icon: Award },
];

const SAMPLE_RECOMMENDATIONS = [
  {
    id: "1",
    title: "Sony WH-1000XM5 Wireless ANC Headphones",
    price: 24990,
    originalPrice: 34990,
    store: "Amazon",
    rating: 4.8,
    category: "Tech & Electronics",
    matchScore: 96,
    verdict: "Perfect Twin Match!",
    savings: 10000,
  },
  {
    id: "2",
    title: "Apple iPhone 15 (128GB, Blue)",
    price: 65990,
    originalPrice: 79900,
    store: "Flipkart",
    rating: 4.7,
    category: "Tech & Electronics",
    matchScore: 92,
    verdict: "Strong Twin Match",
    savings: 13910,
  },
  {
    id: "3",
    title: "Nike Air Max Pulse Lifestyle Sneakers",
    price: 7499,
    originalPrice: 12999,
    store: "Myntra",
    rating: 4.8,
    category: "Fashion",
    matchScore: 94,
    verdict: "High Savings Value",
    savings: 5500,
  },
];

export function DigitalTwinModal() {
  const { profile, isModalOpen, activeTab, closeTwinModal, calibrateTwin, calculateMatch } = useDigitalTwin();

  // Local form state for collection tab
  const [formData, setFormData] = useState<TwinProfile>({ ...profile });
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Simulation test state
  const [testProductTitle, setTestProductTitle] = useState("");
  const [testProductPrice, setTestProductPrice] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const handleStoreToggle = (store: string) => {
    setFormData((prev) => {
      const exists = prev.preferredStores.includes(store);
      return {
        ...prev,
        preferredStores: exists
          ? prev.preferredStores.filter((s) => s !== store)
          : [...prev.preferredStores, store],
      };
    });
  };

  const handleCategoryToggle = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.preferredCategories.includes(cat);
      return {
        ...prev,
        preferredCategories: exists
          ? prev.preferredCategories.filter((c) => c !== cat)
          : [...prev.preferredCategories, cat],
      };
    });
  };

  const handleSaveCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalibrating(true);
    setTimeout(() => {
      calibrateTwin(formData);
      setIsCalibrating(false);
      toast.success("AI Digital Twin Calibrated & Synchronized Successfully!");
    }, 700);
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(testProductPrice);
    if (!testProductTitle || isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid product name and price.");
      return;
    }
    const result = calculateMatch({ title: testProductTitle, price: priceNum, rating: 4.6, store: "Amazon" });
    setTestResult(result);
    toast.success("Simulation Complete!");
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeTwinModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border bg-background shadow-2xl">
        {/* Header Bar */}
        <div className="relative overflow-hidden bg-slate-900 p-6 sm:p-8 text-white rounded-t-3xl border-b border-border/40">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg text-white font-bold">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    ZGenie AI Digital Twin
                  </h2>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    ● Active
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your personalized AI agent that forecasts savings & evaluates product regret risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <Tabs defaultValue={activeTab} key={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted p-1">
              <TabsTrigger value="results" className="rounded-xl font-bold text-xs gap-2 py-2.5">
                <Sparkles className="h-4 w-4 text-purple-500" /> Twin Insights & Results
              </TabsTrigger>
              <TabsTrigger value="collect" className="rounded-xl font-bold text-xs gap-2 py-2.5">
                <Sliders className="h-4 w-4 text-blue-500" /> Calibrate Twin Data
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: RESULTS & INSIGHTS */}
            <TabsContent value="results" className="space-y-6 mt-6 focus-visible:outline-none">
              {/* Twin Avatar Overview Card */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="sm:col-span-2 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-background p-5 rounded-xl shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-semibold">
                        {(() => {
                          const IconComp = PERSONAS.find((p) => p.type === profile.personaType)?.icon || Bot;
                          return <IconComp className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{profile.name}</h3>
                        <Badge variant="outline" className="mt-1 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-semibold capitalize">
                          {profile.personaType.replace("_", " ")} Persona
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      Updated {new Date(profile.lastCalibratedAt || Date.now()).toLocaleDateString()}
                    </Badge>
                  </div>

                  {/* Persona parameters summary */}
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground">Target Budget:</span>
                      <p className="font-bold text-foreground">₹{profile.minBudget.toLocaleString()} - ₹{profile.maxBudget.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price Drop Trigger:</span>
                      <p className="font-bold text-emerald-600">{profile.priceDropThreshold}% Drop Required</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trusted Stores:</span>
                      <p className="font-semibold text-foreground truncate">{profile.preferredStores.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Tolerance:</span>
                      <p className="font-semibold text-foreground">{profile.riskTolerance}/10 ({profile.riskTolerance <= 4 ? "Conservative" : "Moderate"})</p>
                    </div>
                  </div>
                </Card>

                {/* Savings Prediction Stat */}
                <Card className="border border-emerald-500/20 bg-emerald-500/5 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs text-emerald-600 font-bold uppercase tracking-wider">
                      <span>Annual Savings</span>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-3xl font-black text-foreground">
                      ₹24,850
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Estimated savings generated by Twin deal timing & regret avoidance.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                    onClick={() => toast.info("Twin Savings engine is actively monitoring 14 items.")}
                  >
                    View Savings Log
                  </Button>
                </Card>
              </div>

              {/* Twin Match Matrix Radar Breakdown */}
              <Card className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> Twin Decision Matrix Breakdown
                  </h3>
                  <Badge variant="outline" className="text-xs font-semibold">Live Simulation Engine</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Value Alignment Score</span>
                      <span className="font-bold text-blue-600">94%</span>
                    </div>
                    <Progress value={94} className="h-2 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Quality Standard Protection</span>
                      <span className="font-bold text-purple-600">88%</span>
                    </div>
                    <Progress value={88} className="h-2 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Regret Risk Avoidance</span>
                      <span className="font-bold text-emerald-600">96% Safe</span>
                    </div>
                    <Progress value={96} className="h-2 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Store Trust Index</span>
                      <span className="font-bold text-indigo-600">100% Verified</span>
                    </div>
                    <Progress value={100} className="h-2 rounded-full" />
                  </div>
                </div>
              </Card>

              {/* Top Personalized Twin Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" /> Twin Recommended Deals
                  </h3>
                  <span className="text-xs text-muted-foreground">Matched against your profile</span>
                </div>

                <div className="grid gap-3">
                  {SAMPLE_RECOMMENDATIONS.map((item) => {
                    const match = calculateMatch(item);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-blue-500/40 transition-all"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 text-white font-black text-xs rounded-md">
                              {match.matchScore}% Twin Match
                            </Badge>
                            <span className="text-xs font-semibold text-emerald-600">
                              {match.verdict}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Store: <span className="font-medium text-foreground">{item.store}</span> · Rating: <span className="font-semibold text-amber-500">★ {item.rating}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto justify-between border-t sm:border-t-0 border-border pt-2 sm:pt-0">
                          <div>
                            <span className="text-xs text-muted-foreground line-through mr-2">₹{item.originalPrice.toLocaleString()}</span>
                            <span className="text-base font-extrabold text-foreground">₹{item.price.toLocaleString()}</span>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-xl text-xs font-bold h-8 px-4"
                            onClick={() => toast.success(`Viewing deal for ${item.title} on ${item.store}!`)}
                          >
                            Get Deal
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Product Simulator */}
              <Card className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-600" /> Test Any Product Against Your Twin
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enter a product name and price to run a live Twin match simulation.
                  </p>
                </div>

                <form onSubmit={handleRunSimulation} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="e.g. MacBook Air M3, LG OLED TV..."
                    value={testProductTitle}
                    onChange={(e) => setTestProductTitle(e.target.value)}
                    className="h-10 rounded-xl bg-background text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    value={testProductPrice}
                    onChange={(e) => setTestProductPrice(e.target.value)}
                    className="h-10 sm:w-36 rounded-xl bg-background text-xs"
                  />
                  <Button type="submit" className="h-10 rounded-xl px-5 text-xs font-bold shrink-0">
                    Simulate Match
                  </Button>
                </form>

                {testResult && (
                  <div className="rounded-xl border border-emerald-500/30 bg-card p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-foreground">{testResult.verdict}</span>
                      <Badge className="bg-emerald-600 text-white font-black text-xs">
                        {testResult.matchScore}% Match
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                      {testResult.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 2: DATA COLLECTION & CALIBRATION */}
            <TabsContent value="collect" className="space-y-6 mt-6 focus-visible:outline-none">
              <form onSubmit={handleSaveCalibration} className="space-y-6">
                {/* Twin Profile Name */}
                <div className="space-y-2">
                  <Label htmlFor="twin-name" className="text-xs font-bold text-foreground">
                    Digital Twin Identifier / Name
                  </Label>
                  <Input
                    id="twin-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-xl text-xs bg-background"
                    placeholder="e.g. My Shopping Twin"
                    required
                  />
                </div>

                {/* Persona Type Grid */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Select Primary Shopping Persona</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PERSONAS.map((p) => {
                      const selected = formData.personaType === p.type;
                      const IconComp = p.icon;
                      return (
                        <div
                          key={p.type}
                          onClick={() => setFormData({ ...formData, personaType: p.type })}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            selected
                              ? "border-blue-600 bg-blue-500/10 shadow-xs"
                              : "border-border bg-card hover:border-blue-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                              <IconComp className="h-4 w-4" />
                            </span>
                            {selected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                          </div>
                          <h4 className="mt-2.5 text-xs font-semibold text-foreground">{p.title}</h4>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range Inputs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Min Target Budget (₹)</Label>
                    <Input
                      type="number"
                      value={formData.minBudget}
                      onChange={(e) => setFormData({ ...formData, minBudget: parseFloat(e.target.value) || 0 })}
                      className="h-11 rounded-xl text-xs bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Max Target Budget (₹)</Label>
                    <Input
                      type="number"
                      value={formData.maxBudget}
                      onChange={(e) => setFormData({ ...formData, maxBudget: parseFloat(e.target.value) || 0 })}
                      className="h-11 rounded-xl text-xs bg-background"
                      required
                    />
                  </div>
                </div>

                {/* Preferred Retailers Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Preferred Stores & Retailers</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {STORES.map((store) => {
                      const checked = formData.preferredStores.includes(store);
                      return (
                        <button
                          type="button"
                          key={store}
                          onClick={() => handleStoreToggle(store)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                            checked
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {checked ? "✓ " : "+ "}{store}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Categories */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Primary Shopping Categories</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {CATEGORIES.map((cat) => {
                      const checked = formData.preferredCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => handleCategoryToggle(cat)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                            checked
                              ? "border-purple-600 bg-purple-600 text-white"
                              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {checked ? "✓ " : "+ "}{cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Tolerance Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs">
                    <Label className="font-bold text-foreground">Risk & Defect Tolerance Level</Label>
                    <span className="font-semibold text-blue-600">{formData.riskTolerance} / 10 ({formData.riskTolerance <= 4 ? "Ultra Safe" : "Moderate"})</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[formData.riskTolerance]}
                    onValueChange={([v]) => setFormData({ ...formData, riskTolerance: v })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower levels prioritize 4.5+ star verified items to minimize regret risk.
                  </p>
                </div>

                {/* Target Price Drop Threshold */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <Label className="font-bold text-foreground">Desired Price Drop Alert Threshold</Label>
                    <span className="font-semibold text-emerald-600">{formData.priceDropThreshold}% Price Drop</span>
                  </div>
                  <Slider
                    min={5}
                    max={50}
                    step={5}
                    value={[formData.priceDropThreshold]}
                    onValueChange={([v]) => setFormData({ ...formData, priceDropThreshold: v })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCalibrating}
                  className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isCalibrating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Calibrating AI Digital Twin...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Save & Calibrate AI Digital Twin
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
